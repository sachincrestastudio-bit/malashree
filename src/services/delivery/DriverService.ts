import { connectToDatabase } from '../../database/mongoose';
import { DriverProfile } from '../../models/DriverProfile';

export class DriverService {
  /**
   * Toggles the driver's online/offline status.
   */
  static async toggleOnlineStatus(driverId: string, isOnline: boolean) {
    await connectToDatabase();
    
    const profile = await DriverProfile.findOneAndUpdate(
      { user: driverId },
      { 
        isOnline,
        currentStatus: isOnline ? 'available' : 'offline'
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(profile));
  }

  /**
   * Updates the driver's current GPS location.
   */
  static async updateLocation(driverId: string, lat: number, lng: number) {
    await connectToDatabase();
    
    const profile = await DriverProfile.findOneAndUpdate(
      { user: driverId },
      { 
        'location.lat': lat,
        'location.lng': lng,
        'location.lastUpdated': new Date()
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(profile));
  }
}
