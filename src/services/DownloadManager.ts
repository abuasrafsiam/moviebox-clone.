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
}

/**
 * Request filesystem read/write permissions (Android requires this at runtime).
 * Silently skipped on iOS / web (those don't need it).
 */
async function requestStoragePermission(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
        const perm: PermissionStatus = await Filesystem.requestPermissions();
        if (perm.publicStorage !== 'granted') {
            throw new Error('Storage permission denied by user.');
        }
    } catch (err) {
        // On iOS, requestPermissions may not be available — ignore gracefully.
        console.warn('[DownloadManager] Permission request skipped:', err);
    }
}

/**
 * Download a file to the device's Documents directory using @capacitor/file-transfer.
 * Files saved to Directory.Documents are visible in the Files app (iOS) and
 * the device file manager (Android) when UIFileSharingEnabled / LSSupportsOpeningDocumentsInPlace
 * are set in Info.plist.
 *
 * @throws  Error with message 'NATIVE_ONLY' when called outside a native build.
 *          The caller is responsible for showing an appropriate toast / fallback.
 */
export async function startDownload(options: DownloadOptions): Promise<DownloadResult> {
    const { url = MOCK_MP4_URL, filename, onProgress } = options;

    // ── Web guard ─────────────────────────────────────────────────────────────
    if (!Capacitor.isNativePlatform()) {
        throw new Error('NATIVE_ONLY');
    }

    // ── Storage permissions (Android) ────────────────────────────────────────
    await requestStoragePermission();

    // ── Resolve Documents directory URI ──────────────────────────────────────
    const dirResult = await Filesystem.getUri({
        directory: Directory.Documents,
        path: '',
    });
    const targetPath = `${dirResult.uri}/${filename}`;

    // ── Attach progress listener ──────────────────────────────────────────────
    const listenerHandle = await FileTransfer.addListener(
        'progress',
        (event: ProgressStatus) => {
            if (event.lengthComputable && event.contentLength > 0) {
                const percent = Math.round((event.bytes / event.contentLength) * 100);
                onProgress(Math.min(percent, 99)); // reserve 100 for completion
            }
        }
    );

    try {
        // ── Download ─────────────────────────────────────────────────────────────
        const result = await FileTransfer.downloadFile({
            url,
            path: targetPath,
            progress: true, // required to receive progress events
        });

        onProgress(100);
        return { path: result.path ?? targetPath };
    } finally {
        // Always remove the listener so it doesn't fire for future downloads
        await listenerHandle.remove();
    }
}
