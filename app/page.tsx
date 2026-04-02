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

export default function Home() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [error, setError] = useState<string>('');

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
      </div>
    </main>
  );
}
