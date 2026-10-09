interface ServiceWorkerHost {
  serviceWorker?: { register: (scriptUrl: string) => Promise<unknown> }
}

/** Registers the offline worker in production builds; a failure must never break the app. */
export async function registerServiceWorker(host: ServiceWorkerHost, isProduction: boolean): Promise<void> {
  if (!isProduction || !host.serviceWorker) return
  try {
    await host.serviceWorker.register('/sw.js')
  } catch (error) {
    console.warn('Không đăng ký được service worker; app vẫn chạy nhưng không có chế độ offline.', error)
  }
}
