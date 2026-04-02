// Minimal type definitions for WebUSB to allow Next.js TS to compile without @types/w3c-web-usb

interface USBDevice {
    vendorId: number;
    productId: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    opened: boolean;
    configuration: any;
    deviceClass?: number;
    deviceSubclass?: number;
    deviceProtocol?: number;
    deviceVersionMajor?: number;
    deviceVersionMinor?: number;
    deviceVersionSubminor?: number;
    open(): Promise<void>;
    close(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    releaseInterface(interfaceNumber: number): Promise<void>;
    selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
    controlTransferIn(setup: any, length: number): Promise<any>;
    controlTransferOut(setup: any, data?: BufferSource): Promise<any>;
    clearHalt(direction: any, endpointNumber: number): Promise<void>;
    transferIn(endpointNumber: number, length: number): Promise<any>;
    transferOut(endpointNumber: number, data: BufferSource): Promise<any>;
    isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<any>;
    isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: number[]): Promise<any>;
    reset(): Promise<void>;
}

interface USBConnectionEvent extends Event {
    readonly device: USBDevice;
}

interface WebUSB {
    getDevices(): Promise<USBDevice[]>;
    requestDevice(options: { filters: any[] }): Promise<USBDevice>;
    addEventListener(type: 'connect' | 'disconnect', listener: (this: this, ev: USBConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: 'connect' | 'disconnect', listener: (this: this, ev: USBConnectionEvent) => any, options?: boolean | EventListenerOptions): void;
}

interface Navigator {
    readonly usb: WebUSB;
}
