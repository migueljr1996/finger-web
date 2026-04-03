'use client';

import { useState, useEffect } from 'react';

// Simplistic icons for premium feel
const UsbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.51l4.7 4.7a1 1 0 0 1 .3.71v3.08"></path>
    <path d="M14 2v7.51L9.3 14.2a1 1 0 0 0-.3.71v3.08"></path>
    <rect x="8" y="2" width="8" height="4" rx="1"></rect>
    <rect x="13" y="18" width="4" height="4" rx="1"></rect>
    <rect x="7" y="18" width="4" height="4" rx="1"></rect>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-icon">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const FingerprintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2"/>
    <path d="M5 12C5 15.8 8.1 19 12 19C15.8 19 19 15.8 19 12C19 8.1 15.8 5 12 5"/>
    <path d="M8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8"/>
  </svg>
);

export default function Home() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanData, setScanData] = useState<string | null>(null);

  useEffect(() => {
    // Validar en el cliente
    if (typeof window !== 'undefined' && navigator && !navigator.usb) {
      setIsSupported(false);
      return;
    }

    const handleConnect = (e: Event) => {
      const usbEvent = e as USBConnectionEvent;
      console.log('Dispositivo conectado físicamente:', usbEvent.device);
      
      // Si reconectan el dispositivo que teníamos seleccionado
      if (device && usbEvent.device.vendorId === device.vendorId && usbEvent.device.productId === device.productId) {
         setDevice(usbEvent.device);
      }
    };

    const handleDisconnect = (e: Event) => {
      const usbEvent = e as USBConnectionEvent;
      console.log('Dispositivo desconectado físicamente:', usbEvent.device);
      if (device && usbEvent.device.vendorId === device.vendorId && usbEvent.device.productId === device.productId) {
        setDevice(null);
      }
    };

    navigator.usb.addEventListener('connect', handleConnect);
    navigator.usb.addEventListener('disconnect', handleDisconnect);

    return () => {
      navigator.usb.removeEventListener('connect', handleConnect);
      navigator.usb.removeEventListener('disconnect', handleDisconnect);
    };
  }, [device]);

  const requestUSBDevice = async () => {
    setError('');
    try {
      // Abre el popup nativo del navegador para elegir un USB.
      // Se omite 'filters' para que permita seleccionar cualquier cosa e identificar el PID/VID del huellero.
      const selectedDevice = await navigator.usb.requestDevice({ filters: [] });
      setDevice(selectedDevice);
      
      console.log('Dispositivo seleccionado vía Web:', selectedDevice);
      
      // Intenta iniciar la comunicación
      if (!selectedDevice.opened) {
        await selectedDevice.open();
      }
      
      if (selectedDevice.configuration === null) {
        await selectedDevice.selectConfiguration(1);
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotFoundError') {
        setError('No se seleccionó ningún dispositivo. Cerraste el cuadro de diálogo.');
      } else if (err.name === 'SecurityError') {
         setError('Error de seguridad. WebUSB requiere un entorno seguro (HTTPS) o localhost.');
      } else {
        setError(`Error al solicitar dispositivo: ${err.message}`);
      }
    }
  };

  const scanFingerprint = async () => {
    if (!device) return;
    setIsScanning(true);
    setError('');
    setScanData(null);
    try {
      if (!device.opened) {
        await device.open();
      }
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      // Simular intento de reclamar la interfaz
      try {
        if (device.configuration && device.configuration.interfaces[0]) {
          await device.claimInterface(device.configuration.interfaces[0].interfaceNumber);
        }
      } catch (e) {
        console.warn("No se pudo reclamar la interfaz (podría estar ya reclamada)", e);
      }
      
      // Simulamos la duración de la captura de datos (para efecto visual)
      await new Promise(r => setTimeout(r, 2000));
      
      // En un integrador real, aquí se usaría device.transferIn y device.transferOut
      // con los comandos binarios específicos de la marca del huellero.
      
      // Generamos un SVG decorativo para simular la vista previa de la huella
      const svgBase64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2310b981'><path d='M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40S72.1 10 50 10zm0 70C33.4 80 20 66.6 20 50S33.4 20 50 20s30 13.4 30 30-13.4 30-30 30z'/><path d='M50 30c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z'/></svg>";
      
      setScanData(svgBase64);
    } catch (err: any) {
      console.error(err);
      setError(`Error al escanear: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <main className="container">
      <div className="header">
        <h1>WebUSB Fingerprint</h1>
        <p>Detector biométrico y explorador WebUSB</p>
      </div>

      <div className="card">
        <button 
          className="btn" 
          onClick={requestUSBDevice}
          disabled={!isSupported}
        >
          <UsbIcon />
          Conectar Lector Biométrico USB
        </button>

        {!isSupported && (
          <div className="error-message">
            <AlertIcon />
            <div>
              <strong>Navegador Incompatible</strong>
              <p>Tu navegador actual no soporta de forma nativa la API WebUSB (ej. navegadores en iOS). Usa Chrome o Edge para experimentar.</p>
            </div>
          </div>
        )}

        {error && isSupported && (
          <div className="error-message">
            <AlertIcon />
            {error}
          </div>
        )}

        <div className="status-panel">
          <div className="status-header">
            <span className="status-title">Estado de la Conexión USB</span>
            {device ? (
              <span className="badge connected">Conectado</span>
            ) : (
              <span className="badge disconnected">Desconectado</span>
            )}
          </div>

          <div className="device-info">
            <div className="info-row">
              <span className="info-label">Fabricante (Vendor ID)</span>
              <span className="info-value">
                {device?.vendorId ? `0x${device.vendorId.toString(16).padStart(4, '0').toUpperCase()}` : '---'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Producto (Product ID)</span>
              <span className="info-value">
                {device?.productId ? `0x${device.productId.toString(16).padStart(4, '0').toUpperCase()}` : '---'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Nombre del Dispositivo</span>
              <span className="info-value">
                {device?.productName || 'N/A'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Fabricante Declarado</span>
              <span className="info-value">
                {device?.manufacturerName || 'N/A'}
              </span>
            </div>
          </div>
          </div>

          {device && (
            <div className="scan-section">
              <button 
                className="btn" 
                onClick={scanFingerprint}
                disabled={isScanning}
                style={{ backgroundColor: isScanning ? '#475569' : '#10b981' }}
              >
                <FingerprintIcon />
                {isScanning ? 'Escaneando...' : 'Escanear Huella'}
              </button>
              
              <div className="preview-container">
                {isScanning && <div className="scan-animation"></div>}
                {scanData ? (
                  <img src={scanData} alt="Preview de Huella" />
                ) : (
                  <div className="placeholder-text">
                    {isScanning ? 'Coloca tu dedo...' : 'La huella aparecerá aquí'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </main>
  );
}
