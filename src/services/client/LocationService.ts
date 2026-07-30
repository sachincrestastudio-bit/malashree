export interface LocationResult {
  latitude: number;
  longitude: number;
}

export interface GPSError extends Error {
  code?: number;
}

export const requestGPSLocation = async (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const err: GPSError = new Error("Browser does not support GPS.");
      err.code = 2;
      return reject(err);
    }

    // Try high accuracy first (5s timeout for mobile GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (firstErr) => {
        // If high accuracy times out or position is unavailable on desktop, retry with standard location
        if (firstErr.code === 2 || firstErr.code === 3) {
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              resolve({
                latitude: fallbackPos.coords.latitude,
                longitude: fallbackPos.coords.longitude,
              });
            },
            (finalErr) => {
              const err: GPSError = new Error(finalErr.message || "GPS Location failed.");
              err.code = finalErr.code;
              reject(err);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
          );
        } else {
          // Permission denied or other error
          const err: GPSError = new Error(firstErr.message || "Location permission denied.");
          err.code = firstErr.code;
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};
