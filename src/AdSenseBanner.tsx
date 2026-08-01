import { useEffect } from 'react';
import './AdSenseBanner.css';

export const AdSenseBanner = () => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className="adsense-banner-container">
            <div className="adsense-label">Publicidad</div>
            <div className="adsense-slot-wrapper">
                <ins className="adsbygoogle"
                     style={{ display: 'block' }}
                     data-ad-client="ca-pub-4042084914705925"
                     data-ad-slot="1234567890"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <div className="adsense-placeholder">
                    <span>Google AdSense Banner - Espacio Publicitario</span>
                </div>
            </div>
        </div>
    );
};

export default AdSenseBanner;
