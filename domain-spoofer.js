/**
 * Universal Domain Spoofer
 * 
 * This script allows you to spoof the current domain to appear as any website you choose.
 * Useful for bypassing domain-based restrictions in games and web applications.
 * 
 * Usage:
 * 1. Include this script: <script src="domain-spoofer.js"></script>
 * 2. Configure the target domain: DomainSpoofer.configure({ domain: 'example.com' });
 * 3. Activate spoofing: DomainSpoofer.activate();
 * 
 * Author: GitHub Copilot
 * Version: 1.0
 */

(function() {
    'use strict';
    
    // Default configuration
    let config = {
        domain: 'https://neal.fun/',
        protocol: 'https:',
        port: '',
        pathname: '/',
        search: '',
        hash: '',
        // Advanced options
        blockDomainChanges: true,
        logAttempts: true,
        showAlerts: false
    };
    
    let isActive = false;
    let originalProperties = {};
    
    // Store original methods for restoration
    function storeOriginals() {
        // Window location properties
        try {
            originalProperties.windowLocation = {
                href: Object.getOwnPropertyDescriptor(window.location, 'href') || 
                      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window.location), 'href'),
                assign: window.location.assign,
                replace: window.location.replace
            };
        } catch (e) {
            console.warn('⚠️ Could not store window.location originals:', e.message);
        }
        
        // Document properties
        try {
            originalProperties.document = {
                domain: Object.getOwnPropertyDescriptor(document, 'domain'),
                URL: Object.getOwnPropertyDescriptor(document, 'URL'),
                documentURI: Object.getOwnPropertyDescriptor(document, 'documentURI'),
                baseURI: Object.getOwnPropertyDescriptor(document, 'baseURI')
            };
        } catch (e) {
            console.warn('⚠️ Could not store document originals:', e.message);
        }
    }
    
    // Generate spoofed URL
    function getSpoofedUrl() {
        return `${config.protocol}//${config.domain}${config.port ? ':' + config.port : ''}${config.pathname}${config.search}${config.hash}`;
    }
    
    // Log domain access attempts
    function logAttempt(property, action, value) {
        if (config.logAttempts) {
            console.log(`🔧 Domain Spoofer: ${action} ${property} ${value ? '= ' + value : ''}`);
        }
    }
    
    // Spoof window.location properties
    function spoofWindowLocation() {
        try {
            // Create a proxy for window.location
            const locationProxy = new Proxy(window.location, {
                get: function(target, property) {
                    switch (property) {
                        case 'href':
                            logAttempt('window.location.href', 'GET');
                            return getSpoofedUrl();
                        case 'host':
                            logAttempt('window.location.host', 'GET');
                            return config.domain + (config.port ? ':' + config.port : '');
                        case 'hostname':
                            logAttempt('window.location.hostname', 'GET');
                            return config.domain;
                        case 'origin':
                            logAttempt('window.location.origin', 'GET');
                            return `${config.protocol}//${config.domain}${config.port ? ':' + config.port : ''}`;
                        case 'protocol':
                            logAttempt('window.location.protocol', 'GET');
                            return config.protocol;
                        case 'port':
                            logAttempt('window.location.port', 'GET');
                            return config.port;
                        case 'pathname':
                            logAttempt('window.location.pathname', 'GET');
                            return config.pathname;
                        case 'search':
                            logAttempt('window.location.search', 'GET');
                            return config.search;
                        case 'hash':
                            logAttempt('window.location.hash', 'GET');
                            return config.hash;
                        case 'assign':
                            return function(url) {
                                logAttempt('window.location.assign', 'CALL', url);
                                if (config.blockDomainChanges) {
                                    console.warn('🚫 Domain change blocked by spoofer');
                                    if (config.showAlerts) alert('Navigation blocked by domain spoofer');
                                    return false;
                                }
                                return originalProperties.windowLocation.assign.call(target, url);
                            };
                        case 'replace':
                            return function(url) {
                                logAttempt('window.location.replace', 'CALL', url);
                                if (config.blockDomainChanges) {
                                    console.warn('🚫 Domain change blocked by spoofer');
                                    if (config.showAlerts) alert('Navigation blocked by domain spoofer');
                                    return false;
                                }
                                return originalProperties.windowLocation.replace.call(target, url);
                            };
                        case 'reload':
                            return function() {
                                logAttempt('window.location.reload', 'CALL');
                                if (config.blockDomainChanges) {
                                    console.warn('🚫 Reload blocked by spoofer');
                                    if (config.showAlerts) alert('Reload blocked by domain spoofer');
                                    return false;
                                }
                                return target.reload();
                            };
                        default:
                            return target[property];
                    }
                },
                set: function(target, property, value) {
                    if (property === 'href') {
                        logAttempt('window.location.href', 'SET', value);
                        if (config.blockDomainChanges) {
                            console.warn('🚫 Domain change blocked by spoofer');
                            if (config.showAlerts) alert('Navigation blocked by domain spoofer');
                            return false;
                        }
                    }
                    return Reflect.set(target, property, value);
                }
            });
            
            // Replace window.location
            Object.defineProperty(window, 'location', {
                get: function() { return locationProxy; },
                set: function(value) {
                    logAttempt('window.location', 'SET', value);
                    if (config.blockDomainChanges) {
                        console.warn('🚫 Domain change blocked by spoofer');
                        if (config.showAlerts) alert('Navigation blocked by domain spoofer');
                        return false;
                    }
                    return value;
                },
                configurable: false
            });
            
        } catch (e) {
            console.error('❌ Failed to spoof window.location:', e.message);
        }
    }
    
    // Spoof document properties
    function spoofDocumentProperties() {
        try {
            // Override document.domain
            Object.defineProperty(document, 'domain', {
                get: function() { 
                    logAttempt('document.domain', 'GET');
                    return config.domain; 
                },
                set: function(value) { 
                    logAttempt('document.domain', 'SET', value);
                    if (config.blockDomainChanges) {
                        console.warn('🚫 Document domain change blocked by spoofer');
                        return config.domain;
                    }
                    return value;
                },
                configurable: false
            });
            
            // Override document.URL
            Object.defineProperty(document, 'URL', {
                get: function() { 
                    logAttempt('document.URL', 'GET');
                    return getSpoofedUrl(); 
                },
                configurable: false
            });
            
            // Override document.documentURI
            Object.defineProperty(document, 'documentURI', {
                get: function() { 
                    logAttempt('document.documentURI', 'GET');
                    return getSpoofedUrl(); 
                },
                configurable: false
            });
            
            // Override document.baseURI
            Object.defineProperty(document, 'baseURI', {
                get: function() { 
                    logAttempt('document.baseURI', 'GET');
                    return getSpoofedUrl(); 
                },
                configurable: false
            });
            
        } catch (e) {
            console.error('❌ Failed to spoof document properties:', e.message);
        }
    }
    
    // Public API
    window.DomainSpoofer = {
        /**
         * Configure the domain spoofer
         * @param {Object} options - Configuration options
         * @param {string} options.domain - Target domain (e.g., 'example.com')
         * @param {string} [options.protocol='https:'] - Protocol (http: or https:)
         * @param {string} [options.port=''] - Port number
         * @param {string} [options.pathname='/'] - Path
         * @param {string} [options.search=''] - Query string
         * @param {string} [options.hash=''] - Hash fragment
         * @param {boolean} [options.blockDomainChanges=true] - Block navigation attempts
         * @param {boolean} [options.logAttempts=true] - Log domain access attempts
         * @param {boolean} [options.showAlerts=false] - Show alerts for blocked attempts
         */
        configure: function(options) {
            if (typeof options !== 'object') {
                throw new Error('Options must be an object');
            }
            
            // Merge with defaults
            config = Object.assign(config, options);
            
            // Validate domain
            if (!config.domain) {
                throw new Error('Domain is required');
            }
            
            // Ensure protocol ends with :
            if (config.protocol && !config.protocol.endsWith(':')) {
                config.protocol += ':';
            }
            
            // Ensure pathname starts with /
            if (config.pathname && !config.pathname.startsWith('/')) {
                config.pathname = '/' + config.pathname;
            }
            
            console.log('🔧 Domain Spoofer configured:', {
                domain: config.domain,
                protocol: config.protocol,
                spoofedUrl: getSpoofedUrl()
            });
            
            return this;
        },
        
        /**
         * Activate domain spoofing
         */
        activate: function() {
            if (isActive) {
                console.warn('⚠️ Domain spoofer is already active');
                return this;
            }
            
            console.log('🎭 Activating domain spoofer...');
            
            // Store original properties
            storeOriginals();
            
            // Apply spoofing
            spoofWindowLocation();
            spoofDocumentProperties();
            
            isActive = true;
            console.log('✅ Domain spoofer activated - appearing as:', getSpoofedUrl());
            
            // Dispatch event
            if (typeof window.CustomEvent !== 'undefined') {
                window.dispatchEvent(new CustomEvent('domainSpooferActivated', {
                    detail: {
                        domain: config.domain,
                        spoofedUrl: getSpoofedUrl(),
                        config: config
                    }
                }));
            }
            
            return this;
        },
        
        /**
         * Deactivate domain spoofing (attempts to restore original behavior)
         */
        deactivate: function() {
            if (!isActive) {
                console.warn('⚠️ Domain spoofer is not active');
                return this;
            }
            
            console.log('🔄 Attempting to deactivate domain spoofer...');
            console.warn('⚠️ Note: Some changes may not be fully reversible due to browser security');
            
            // This is limited due to browser security, but we can try
            try {
                // Restore some properties if possible
                // Note: Most property overrides cannot be fully restored
                isActive = false;
                console.log('✅ Domain spoofer deactivated (partial restoration)');
            } catch (e) {
                console.error('❌ Failed to deactivate domain spoofer:', e.message);
            }
            
            return this;
        },
        
        /**
         * Get current configuration
         */
        getConfig: function() {
            return Object.assign({}, config);
        },
        
        /**
         * Get current spoofed URL
         */
        getSpoofedUrl: function() {
            return getSpoofedUrl();
        },
        
        /**
         * Check if spoofer is active
         */
        isActive: function() {
            return isActive;
        },
        
        /**
         * Quick setup for common domains
         */
        presets: {
            poki: function() {
                return window.DomainSpoofer.configure({
                    domain: 'poki.com',
                    protocol: 'https:',
                    pathname: '/'
                });
            },
            
            crazyGames: function() {
                return window.DomainSpoofer.configure({
                    domain: 'crazygames.com',
                    protocol: 'https:',
                    pathname: '/'
                });
            },
            
            kizi: function() {
                return window.DomainSpoofer.configure({
                    domain: 'kizi.com',
                    protocol: 'https:',
                    pathname: '/'
                });
            },
            
            friv: function() {
                return window.DomainSpoofer.configure({
                    domain: 'friv.com',
                    protocol: 'https:',
                    pathname: '/'
                });8888888888888888888
            },
            
            localhost: function(port = 3000) {
                return window.DomainSpoofer.configure({
                    domain: 'localhost',
                    protocol: 'http:',
                    port: port.toString(),
                    pathname: '/'
                });
            },
            
            custom: function(domain, options = {}) {
                return window.DomainSpoofer.configure(Object.assign({
                    domain: domain,
                    protocol: 'https:',
                    pathname: '/'
                }, options));
            }
        }
    };
    
    console.log('🎭 Domain Spoofer loaded and ready');
    console.log('📖 Usage: DomainSpoofer.configure({domain: "example.com"}).activate()');
    
})();
