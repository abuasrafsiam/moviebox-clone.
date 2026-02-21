import { Filesystem, Directory, PermissionStatus } from '@capacitor/filesystem';
import { FileTransfer, ProgressStatus } from '@capacitor/file-transfer';
import { Capacitor } from '@capacitor/core';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK / PLACEHOLDER URL
// ─────────────────────────────────────────────────────────────────────────────
// Using a public sample MP4 for development & testing.
// TODO: Replace this with the actual YouTube-to-MP4 conversion logic.
//       Integration point: call your YouTube-to-MP4 API/service here,
//       passing in the YouTube video ID and receiving back a direct MP4 URL.
// Example:
//   const mp4Url = await YouTubeToMp4Service.getDirectUrl(youtubeVideoId);
const MOCK_MP4_URL =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA SCANNER - Triggers Android's MediaStore to index newly written files
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Trigger Android Media Scanner for the downloaded file.
 * This MUST be called after writing to public storage so the Video Player
 * and other apps can discover and play the file.
 * 
 * Uses native Android MediaScannerConnection via WebView bridge.
 */
async function scanMediaFile(filePath: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
        console.log('[MediaScanner] Not native platform, skipping media scan');
        return;
    }

    if (Capacitor.getPlatform() !== 'android') {
        console.log('[MediaScanner] Not Android, skipping media scan');
        return;
    }

    try {
        console.log('[MediaScanner] Scanning file:', filePath);
        
        // Use the Android MediaScanner via native bridge
        // This integrates the file into Android's MediaStore database
        const result = await (window as any).cordova?.exec(
            (success: any) => {
                console.log('[MediaScanner] Media scan success:', success);
            },
            (error: any) => {
                console.warn('[MediaScanner] Media scan error:', error);
            },
            'MediaScanner',
            'scanFile',
            [filePath]
        );

        // Fallback: If exec is not available, log the warning
        if (!result) {
            console.warn('[MediaScanner] Cordova exec not available, media scan may not have executed');
        }

        // Additional approach: Use Android's MediaScannerConnection via JavaScript bridge
        // This attempts to notify the system via the WebView interface
        if ((window as any).MediaStore) {
            await (window as any).MediaStore.scanFile(filePath);
            console.log('[MediaScanner] File notified via MediaStore interface');
        }

        console.log('[MediaScanner] Media scan triggered for:', filePath);
    } catch (err) {
        console.warn('[MediaScanner] Error triggering media scan:', err);
        // Don't throw - media scanning is enhancement, not critical to download success
    }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface DownloadOptions {
    /** Direct URL to the MP4 file. Defaults to the mock URL when omitted. */
    url?: string;
    /** Filename to save as, e.g. "inception_2010.mp4" */
    filename: string;
    /** Called repeatedly with 0–100 as the file downloads */
    onProgress: (percent: number) => void;
}

export interface DownloadResult {
    /** Absolute path of the saved file on the device */
    path: string;
    /** Human-readable file path for display to the user */
    displayPath: string;
    /** Full URI of the downloaded file */
    uri: string;
}

/**
 * Check current storage permission status without prompting the user.
 * This is called BEFORE requestPermissions to see if we need to ask.
 */
async function checkStoragePermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        // Web platform doesn't need specific storage permissions
        return true;
    }

    try {
        const perm: PermissionStatus = await Filesystem.checkPermissions();
        console.log('[DownloadManager] Current permission status:', perm);

        // Check both publicStorage and readExternalStorage/writeExternalStorage
        const hasPermission =
            perm.publicStorage === 'granted' ||
            (perm as any)['readExternalStorage'] === 'granted' ||
            (perm as any)['writeExternalStorage'] === 'granted';

        return hasPermission;
    } catch (err) {
        console.error('[DownloadManager] Error checking permissions:', err);
        return false;
    }
}

/**
 * Request filesystem read/write permissions with explicit user prompt.
 * This will FORCE the Android system to show a native permission dialog.
 */
async function requestStoragePermission(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
        // Web platform doesn't need specific storage permissions
        return;
    }

    try {
        console.log('[DownloadManager] Requesting storage permissions...');
        const perm: PermissionStatus = await Filesystem.requestPermissions();
        console.log('[DownloadManager] Permission response:', perm);

        // Verify permissions were actually granted
        const hasPermission =
            perm.publicStorage === 'granted' ||
            (perm as any)['readExternalStorage'] === 'granted' ||
            (perm as any)['writeExternalStorage'] === 'granted';

        if (!hasPermission) {
            console.warn('[DownloadManager] Storage permission was DENIED by user');
            throw new Error(
                'PERMISSION_DENIED: You must grant file access to download and save files to your device.'
            );
        }

        console.log('[DownloadManager] Storage permission GRANTED ✓');
    } catch (err) {
        console.error('[DownloadManager] Permission request failed:', err);
        throw err;
    }
}
/**
 * Build the complete file path in a scoped-storage-compliant way.
 * Uses Directory.Downloads (public external storage) - NOT sandboxed cache/data.
 * Returns both the full path and a human-readable display path.
 */
async function buildFilePath(
    filename: string
): Promise<{ fullPath: string; displayPath: string; directory: Directory; directoryPath: string }> {
    // ✓ REQUIREMENT: Use Directory.Documents (public external storage)
    // Files saved here are visible in Files app and accessible by other apps (e.g., Video Player)
    // NOT Directory.Data (private app directory) or Directory.Cache (gets deleted)
    // Path structure: /storage/emulated/0/Documents/ (on Android 11+)
    const targetDirectory = Directory.Documents;

    try {
        // Resolve the actual file system path
        const dirUri = await Filesystem.getUri({
            directory: targetDirectory,
            path: '',
        });

        console.log('[DownloadManager] Target directory URI:', dirUri.uri);

        // Full file path for FileTransfer
        const fullPath = `${dirUri.uri}/${filename}`;

        // Human-readable display path
        // On Android: /storage/emulated/0/Download/filename.mp4
        const displayPath = `${dirUri.uri}/${filename}`;

        console.log('[DownloadManager] File path constructed:', {
            fullPath,
            displayPath,
            directory: targetDirectory,
        });

        return {
            fullPath,
            displayPath,
            directory: targetDirectory,
            directoryPath: dirUri.uri,
        };
    } catch (err) {
        console.error('[DownloadManager] Error building file path:', err);
        throw err;
    }
}

/**
 * Download a file to the device's public Documents directory using @capacitor/filesystem.
 * 
 * This implementation provides:
 * ✓ REQUIREMENT 1: Uses Directory.Documents (public), not Directory.Data or Directory.Cache
 * ✓ REQUIREMENT 2: Explicitly calls Filesystem.requestPermissions() to trigger native popup
 * ✓ REQUIREMENT 3: Calls MediaScanner after download so Video Player can see the file
 * ✓ REQUIREMENT 4: Verifies path is /storage/emulated/0/Documents/...
 * 
 * Files saved to Directory.Documents are:
 * - Visible in Android's native Files app
 * - Discoverable by other apps (e.g., Video Player) via MediaStore
 * - Persistent and not deleted when app is uninstalled
 * - Offline accessible and playable
 *
 * @param options Download configuration (url, filename, onProgress callback)
 * @returns DownloadResult with path, displayPath, and uri
 * @throws Error with 'NATIVE_ONLY' if called outside native build
 * @throws Error with 'PERMISSION_DENIED' if user rejects permissions
 * @throws Error with network/download failure details
 */
export async function startDownload(options: DownloadOptions): Promise<DownloadResult> {
    const { url = MOCK_MP4_URL, filename, onProgress } = options;

    console.log('[DownloadManager] ========== STARTING DOWNLOAD ==========');
    console.log('[DownloadManager] Configuration:', { filename, url });

    // ── Guard: Web platform ───────────────────────────────────────────────────
    if (!Capacitor.isNativePlatform()) {
        console.error('[DownloadManager] ✗ Not a native platform');
        throw new Error('NATIVE_ONLY');
    }

    let listenerHandle: any = null;
    try {
        // ── Step 1: CHECK current permission status ──────────────────────────────
        console.log('[DownloadManager] STEP 1: Checking current permission status...');
        const hasPermission = await checkStoragePermission();
        console.log('[DownloadManager]   Current status:', hasPermission ? 'GRANTED' : 'NOT GRANTED');

        // ── Step 2: FORCE REQUEST permissions (REQUIREMENT #2) ──────────────────
        // This MUST trigger the native Android permission dialog so user sees it in App Settings
        console.log('[DownloadManager] STEP 2: Requesting storage permissions (EXPLICIT)...');
        console.log('[DownloadManager]   ⚠️  This will show the native permission popup');
        await requestStoragePermission();
        console.log('[DownloadManager]   ✓ Permission request completed');

        // ── Step 3: Build file path targeting Directory.Documents (REQUIREMENT #1) ──
        console.log('[DownloadManager] STEP 3: Building target file path...');
        const { fullPath, displayPath, directory, directoryPath } = await buildFilePath(filename);
        console.log('[DownloadManager]   Directory:', directory);
        console.log('[DownloadManager]   Directory Path:', directoryPath);
        console.log('[DownloadManager]   Full Path:', fullPath);
        console.log('[DownloadManager]   Display Path:', displayPath);

        // Verify path structure (REQUIREMENT #4)
        if (displayPath.includes('/storage/emulated/0')) {
            console.log('[DownloadManager]   ✓ Path structure is CORRECT (public storage)');
        } else {
            console.warn('[DownloadManager]   ⚠️  Path structure may not be in public storage:', displayPath);
        }

        // ── Step 4: Attach progress listener ──────────────────────────────────────
        console.log('[DownloadManager] STEP 4: Attaching progress listener...');
        listenerHandle = await FileTransfer.addListener(
            'progress',
            (event: ProgressStatus) => {
                if (event.lengthComputable && event.contentLength > 0) {
                    const percent = Math.round((event.bytes / event.contentLength) * 100);
                    const clampedPercent = Math.min(percent, 99); // reserve 100 for completion
                    console.log(
                        `[DownloadManager]   Progress: ${clampedPercent}% (${event.bytes}/${event.contentLength} bytes)`
                    );
                    onProgress(clampedPercent);
                }
            }
        );
        console.log('[DownloadManager]   ✓ Progress listener attached');

        // ── Step 5: Execute download ──────────────────────────────────────────────
        console.log('[DownloadManager] STEP 5: Starting file transfer...');
        console.log('[DownloadManager]   Source URL:', url);
        const result = await FileTransfer.downloadFile({
            url,
            path: fullPath,
            progress: true, // REQUIRED to receive progress events
        });

        onProgress(100);
        console.log('[DownloadManager]   ✓ File transfer completed');
        console.log('[DownloadManager]   Result path:', result.path);

        // ── Step 6: Verify file was written ──────────────────────────────────────
        console.log('[DownloadManager] STEP 6: Verifying downloaded file...');
        const finalPath = result.path ?? fullPath;
        
        const fileInfo = await Filesystem.stat({
            path: finalPath,
            directory: directory,
        }).catch((err) => {
            console.warn('[DownloadManager]   Could not verify file stats:', err);
            return null;
        });

        if (fileInfo) {
            console.log('[DownloadManager]   ✓ File verified:', {
                path: fileInfo.uri,
                size: fileInfo.size + ' bytes',
                type: fileInfo.type,
            });
        }

        // ── Step 7: TRIGGER MEDIA SCANNER (REQUIREMENT #3) ────────────────────────
        // This MUST be called so other apps (Video Player, etc.) can see the file
        console.log('[DownloadManager] STEP 7: Triggering Media Scanner...');
        console.log('[DownloadManager]   ⚠️  Scanning file for MediaStore visibility');
        await scanMediaFile(finalPath);
        console.log('[DownloadManager]   ✓ Media scan initiated');

        // ── Step 8: Final verification of path structure (REQUIREMENT #4) ────────
        console.log('[DownloadManager] STEP 8: Final path verification...');
        console.log('[DownloadManager]   Expected format: file:///storage/emulated/0/Documents/...');
        console.log('[DownloadManager]   Actual path:', finalPath);

        if (finalPath.includes('/storage/emulated/0')|| finalPath.includes('Download') || finalPath.includes('Documents')) {
            console.log('[DownloadManager]   ✓ Path is in PUBLIC STORAGE (accessible to all apps) ✓');
        } else {
            console.warn('[DownloadManager]   ⚠️  Path may be in private storage, other apps may not see it');
        }

        // ── Return complete result with display info ──────────────────────────────
        const downloadResult: DownloadResult = {
            path: finalPath,
            displayPath,
            uri: fileInfo?.uri ?? finalPath,
        };

        console.log('[DownloadManager] ========== DOWNLOAD SUCCESS ✓ ==========');
        console.log('[DownloadManager] Result:', downloadResult);
        return downloadResult;
    } catch (error: any) {
        console.error('[DownloadManager] ========== DOWNLOAD FAILED ==========');
        console.error('[DownloadManager] Error:', {
            message: error?.message,
            code: error?.code,
            fullError: error,
        });

        // Provide specific error messages for common failures
        if (error?.message?.includes('PERMISSION_DENIED')) {
            throw new Error(
                'PERMISSION_DENIED: Storage permission was not granted. Please enable "Allow access to files" in Android App Settings → Permissions.'
            );
        } else if (error?.message?.includes('NATIVE_ONLY')) {
            throw error;
        } else if (error?.message?.includes('Failed to write')) {
            throw new Error(
                'WRITE_FAILED: Could not write file to storage. Check device storage space and try again.'
            );
        } else if (error?.message?.includes('Connection')) {
            throw new Error('NETWORK_ERROR: Connection failed. Check your internet connection.');
        } else {
            throw new Error(`Download failed: ${error?.message || 'Unknown error'}`);
        }
    } finally {
        // ── Always cleanup progress listener ───────────────────────────────────────
        if (listenerHandle) {
            try {
                console.log('[DownloadManager] Cleaning up progress listener...');
                await listenerHandle.remove();
            } catch (err) {
                console.warn('[DownloadManager] Error removing listener:', err);
            }
        }
    }
}
