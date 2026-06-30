import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './Modal';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
    const [scanError, setScanError] = useState('');
    const scannerRef = useRef(null);
    const html5QrCode = useRef(null);

    useEffect(() => {
        if (isOpen) {
            html5QrCode.current = new Html5Qrcode("qr-reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            html5QrCode.current.start(
                { facingMode: "environment" }, 
                config, 
                (decodedText) => {
                    // Berhasil scan
                    html5QrCode.current.stop().then(() => {
                        onScanSuccess(decodedText);
                        onClose();
                    });
                },
                (errorMessage) => {
                    // Error biasanya terjadi terus menerus saat kamera tidak mendeteksi QR. Abaikan error biasa.
                }
            ).catch(err => {
                setScanError('Tidak dapat mengakses kamera. Pastikan memberikan izin.');
            });
        } else {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(err => console.error("Error stopping scanner", err));
            }
        }
        
        return () => {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(err => console.error("Error stopping scanner", err));
            }
        };
    }, [isOpen, onScanSuccess, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code Aset">
            <div className="flex flex-col items-center">
                {scanError ? (
                    <p className="text-red-400 text-sm mb-4">{scanError}</p>
                ) : (
                    <p className="text-gray-400 text-xs mb-4 text-center">
                        Arahkan kamera ke QR Code yang menempel pada barang inventaris.
                    </p>
                )}
                
                <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden' }}></div>
                
                <div className="mt-6">
                    <button onClick={onClose} className="btn-ghost">Batal Scan</button>
                </div>
            </div>
        </Modal>
    );
}
