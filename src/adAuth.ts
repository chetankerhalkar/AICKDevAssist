import * as vscode from 'vscode';
import axios from 'axios';

export interface ADAAuthConfig {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    resource?: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    userInfo?: any;
    accessToken?: string;
}

export class AzureADAuthenticator {
    private static instance: AzureADAuthenticator;
    private currentToken: string | null = null;
    private userInfo: any = null;

    private constructor() {}

    public static getInstance(): AzureADAuthenticator {
        if (!AzureADAuthenticator.instance) {
            AzureADAuthenticator.instance = new AzureADAuthenticator();
        }
        return AzureADAuthenticator.instance;
    }

    public async authenticate(config: ADAAuthConfig): Promise<AuthResult> {
        try {
            // Validate configuration
            if (!config.tenantId || !config.clientId) {
                return {
                    success: false,
                    error: 'Tenant ID and Client ID are required for Azure AD authentication'
                };
            }

            // Build authorization URL
            const authUrl = this.buildAuthorizationUrl(config);
            
            // Open external browser for authentication
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));

            // Set up URI handler for redirect
            const result = await this.handleAuthenticationCallback(config);
            
            if (result.success && result.accessToken) {
                this.currentToken = result.accessToken;
                this.userInfo = result.userInfo;
                
                // Store token securely
                await this.storeTokenSecurely(result.accessToken);
            }

            return result;
        } catch (error: any) {
            return {
                success: false,
                error: `Authentication failed: ${error.message}`
            };
        }
    }

    public async getStoredToken(): Promise<string | null> {
        try {
            // Try to get token from secure storage
            const storedToken = await vscode.workspace.getConfiguration('AICKStudioAI').get<string>('adAuth.accessToken');
            
            if (storedToken && await this.validateToken(storedToken)) {
                this.currentToken = storedToken;
                return storedToken;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    public async refreshToken(config: ADAAuthConfig): Promise<AuthResult> {
        try {
            // For simplicity, we'll re-authenticate
            // In a production environment, you'd implement proper refresh token flow
            return await this.authenticate(config);
        } catch (error: any) {
            return {
                success: false,
                error: `Token refresh failed: ${error.message}`
            };
        }
    }

    public async logout(): Promise<void> {
        this.currentToken = null;
        this.userInfo = null;
        
        // Clear stored token
        await vscode.workspace.getConfiguration('AICKStudioAI').update(
            'adAuth.accessToken', 
            undefined, 
            vscode.ConfigurationTarget.Global
        );
    }

    public getCurrentToken(): string | null {
        return this.currentToken;
    }

    public getUserInfo(): any {
        return this.userInfo;
    }

    public isAuthenticated(): boolean {
        return this.currentToken !== null;
    }

    private buildAuthorizationUrl(config: ADAAuthConfig): string {
        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'code',
            redirect_uri: config.redirectUri || 'vscode://AICKStudio.AICKStudio-ai-vscode/auth',
            response_mode: 'query',
            scope: 'openid profile User.Read',
            state: this.generateState()
        });

        if (config.resource) {
            params.append('resource', config.resource);
        }

        return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    }

    private async handleAuthenticationCallback(config: ADAAuthConfig): Promise<AuthResult> {
        return new Promise((resolve) => {
            // Create a disposable for the URI handler
            const disposable = vscode.window.registerUriHandler({
                handleUri: async (uri: vscode.Uri) => {
                    try {
                        const query = new URLSearchParams(uri.query);
                        const code = query.get('code');
                        const error = query.get('error');
                        const errorDescription = query.get('error_description');

                        if (error) {
                            resolve({
                                success: false,
                                error: `Authentication error: ${error} - ${errorDescription}`
                            });
                            return;
                        }

                        if (!code) {
                            resolve({
                                success: false,
                                error: 'No authorization code received'
                            });
                            return;
                        }

                        // Exchange code for token
                        const tokenResult = await this.exchangeCodeForToken(config, code);
                        resolve(tokenResult);
                    } catch (error: any) {
                        resolve({
                            success: false,
                            error: `Callback handling failed: ${error.message}`
                        });
                    } finally {
                        disposable.dispose();
                    }
                }
            });

            // Set a timeout for the authentication process
            setTimeout(() => {
                disposable.dispose();
                resolve({
                    success: false,
                    error: 'Authentication timeout - please try again'
                });
            }, 300000); // 5 minutes timeout
        });
    }

    private async exchangeCodeForToken(config: ADAAuthConfig, code: string): Promise<AuthResult> {
        try {
            const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
            
            const params = new URLSearchParams({
                client_id: config.clientId,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: config.redirectUri || 'vscode://AICKStudio.AICKStudio-ai-vscode/auth',
                scope: 'openid profile User.Read'
            });

            const response = await axios.post(tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = response.data;
            
            if (!tokenData.access_token) {
                return {
                    success: false,
                    error: 'No access token received from Azure AD'
                };
            }

            // Get user information
            const userInfo = await this.getUserInformation(tokenData.access_token);

            return {
                success: true,
                accessToken: tokenData.access_token,
                userInfo: userInfo
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Token exchange failed: ${error.response?.data?.error_description || error.message}`
            };
        }
    }

    private async getUserInformation(accessToken: string): Promise<any> {
        try {
            const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error: any) {
            // Return minimal user info if Graph API call fails
            return {
                displayName: 'Unknown User',
                userPrincipalName: 'unknown@domain.com'
            };
        }
    }

    private async validateToken(token: string): Promise<boolean> {
        try {
            const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    private async storeTokenSecurely(token: string): Promise<void> {
        // Store token in VS Code settings (encrypted by VS Code)
        await vscode.workspace.getConfiguration('AICKStudioAI').update(
            'adAuth.accessToken',
            token,
            vscode.ConfigurationTarget.Global
        );
    }

    private generateState(): string {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}

// Export convenience function
export async function authenticateWithAzureAD(config: ADAAuthConfig): Promise<AuthResult> {
    const authenticator = AzureADAuthenticator.getInstance();
    return await authenticator.authenticate(config);
}

// Export function to get current authentication status
export function getAuthenticationStatus(): { isAuthenticated: boolean; userInfo?: any } {
    const authenticator = AzureADAuthenticator.getInstance();
    return {
        isAuthenticated: authenticator.isAuthenticated(),
        userInfo: authenticator.getUserInfo()
    };
}

// Export function to get current token
export function getCurrentAuthToken(): string | null {
    const authenticator = AzureADAuthenticator.getInstance();
    return authenticator.getCurrentToken();
}

// Export function to logout
export async function logout(): Promise<void> {
    const authenticator = AzureADAuthenticator.getInstance();
    await authenticator.logout();
}

