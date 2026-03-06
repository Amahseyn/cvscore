/**
 * Location Service for CVScore Pro
 * Handles precise geolocation, IP-based tracking, and manual location updates.
 */

const API_BASE_URL = 'http://localhost:8000';

export interface LocationData {
    method: 'browser' | 'ip' | 'manual';
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    city?: string;
    region?: string;
    country?: string;
}

export const LocationService = {
    /**
     * Method 1: Precise Geolocation (Browser API)
     * Requests user permission and gets high-accuracy coordinates.
     */
    async trackPreciseLocation(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    try {
                        const data = await this.updateLocation(token, {
                            method: 'browser',
                            latitude,
                            longitude,
                            accuracy,
                        });
                        resolve(data);
                    } catch (err) {
                        reject(err);
                    }
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    },

    /**
     * Method 2: IP-Based Geolocation (Automated)
     * No user interaction required. Backend resolves location from request IP.
     */
    async trackIPLocation(token: string): Promise<any> {
        return this.updateLocation(token, { method: 'ip' });
    },

    /**
     * Method 3: Manual Location (User Profile)
     * Allows users to manually specify their location.
     */
    async trackManualLocation(token: string, city: string, country: string): Promise<any> {
        return this.updateLocation(token, {
            method: 'manual',
            city,
            country,
        });
    },

    /**
     * Internal helper to send location data to the backend
     */
    async updateLocation(token: string, data: LocationData): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/users/me/location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update location');
        }

        return response.json();
    },

    /**
     * Get location history for the user
     */
    async getLocationHistory(token: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/users/me/location/history`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch location history');
        }

        return response.json();
    }
};
