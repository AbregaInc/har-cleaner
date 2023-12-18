import { Har, Request, Response, Header } from "har-format";

export type SanitizeOptions = {
    scrubAllRequestHeaders?: boolean;
    scrubAllCookies?: boolean;
    scrubSpecificHeader?: string[];
    scrubSpecificCookie?: string[];
    scrubAllQueryParams?: boolean;
    scrubSpecificQueryParam?: string[];
    scrubAllPostParams?: boolean;
    scrubSpecificPostParam?: string[];
    scrubAllResponseHeaders?: boolean;
    scrubSpecificResponseHeader?: string[];
    scrubAllBodyContents?: boolean;
    scrubSpecificMimeTypes?: string[];
};

export const defaultMimeTypesList = [
    "application/javascript",
    "text/javascript"
];

export const defaultWordList = [
	"Authorization",
	"SAMLRequest",
	"SAMLResponse",
	"access_token",
	"appID",
	"assertion",
	"auth",
	"authenticity_token",
	"challenge",
	"client_id",
	"client_secret",
	"code",
	"code_challenge",
	"code_verifier",
	"email",
	"facetID",
	"fcParams",
	"id_token",
	"password",
	"refresh_token",
	"serverData",
	"shdf",
	"state",
	"token",
	"usg",
	"vses2",
	"x-client-data",
];

export function sanitizeHar(har: Har, options?: SanitizeOptions): Har {

    // Apply default values if options are not provided
    const effectiveOptions = {
        scrubAllRequestHeaders: options?.scrubAllRequestHeaders || false,
        scrubAllCookies: options?.scrubAllCookies || false,
        scrubAllQueryParams: options?.scrubAllQueryParams || false,
        scrubAllPostParams: options?.scrubAllPostParams || false,
        scrubAllResponseHeaders: options?.scrubAllResponseHeaders || false,
        scrubAllBodyContents: options?.scrubAllBodyContents || false,
        scrubSpecificMimeTypes: options?.scrubSpecificMimeTypes || defaultMimeTypesList,
        scrubSpecificHeader: options?.scrubSpecificHeader || defaultWordList,
        scrubSpecificResponseHeader: options?.scrubSpecificResponseHeader|| defaultWordList,
        scrubSpecificPostParam: options?.scrubSpecificPostParam || defaultWordList,
        scrubSpecificCookie: options?.scrubSpecificCookie || defaultWordList,
        scrubSpecificQueryParam: options?.scrubSpecificQueryParam || defaultWordList,
    };

    //console.log('effective options ', effectiveOptions);

    har.log.entries.forEach(entry => {
        sanitizeRequest(entry.request, effectiveOptions);
        sanitizeResponse(entry.response, effectiveOptions);
    });

    return har;
}

function sanitizeRequest(request: Request, options: SanitizeOptions = {}) {

    //console.log('Options in harSanitizer: ', options);

    // Handling headers

    if (options.scrubAllRequestHeaders) {
        //console.log('Scrubbing all request headers');
        request.headers = options.scrubSpecificHeader ? 
            request.headers.filter(header => {
                const shouldKeep = options.scrubSpecificHeader?.some(specificHeader => 
                    specificHeader.toLowerCase() === header.name.toLowerCase());
                //console.log(`Checking header ${header.name}: Keep? ${shouldKeep}`);
                return shouldKeep;
            }) : [];
        //console.log('Final headers after scrubbing all: ', request.headers);
    } else if (options.scrubSpecificHeader) {
        //console.log('Scrubbing specific request headers:', options.scrubSpecificHeader);
        request.headers = request.headers.filter(header => {
            const shouldRemove = options.scrubSpecificHeader?.some(specificHeader => 
                specificHeader.toLowerCase() === header.name.toLowerCase());
            //console.log(`Checking header ${header.name}: Remove? ${shouldRemove}`);
            return !shouldRemove;
        });
        //console.log('Final headers after scrubbing specific: ', request.headers);
    }


    // Handling cookies
    if (options.scrubAllCookies) {
        //console.log('Scrubbing all cookies');
        request.cookies = options.scrubSpecificCookie ? 
            request.cookies.filter(cookie => {
                const shouldKeep = options.scrubSpecificCookie?.some(specificCookie => 
                    specificCookie.toLowerCase() === cookie.name.toLowerCase());
                //console.log(`Checking cookie ${cookie.name}: Keep? ${shouldKeep}`);
                return shouldKeep;
            }) : [];
        //console.log('Final cookies after scrubbing all: ', request.cookies);
    } else if (options.scrubSpecificCookie) {
        //console.log('Scrubbing specific cookies:', options.scrubSpecificCookie);
        request.cookies = request.cookies.filter(cookie => {
            const shouldRemove = options.scrubSpecificCookie?.some(specificCookie => 
                specificCookie.toLowerCase() === cookie.name.toLowerCase());
            //console.log(`Checking cookie ${cookie.name}: Remove? ${shouldRemove}`);
            return !shouldRemove;
        });
        //console.log('Final cookies after scrubbing specific: ', request.cookies);
    }

    // Handling query parameters
    if (options.scrubAllQueryParams) {
        //console.log('Scrubbing all query parameters');
        const url = new URL(request.url);
        if (options.scrubSpecificQueryParam) {
            //console.log('Scrubbing specific query parameters to keep:', options.scrubSpecificQueryParam);
            const url = new URL(request.url);
        
            // Iterate through searchParams and delete those that should not be kept
            for (const param of url.searchParams) {
                const shouldKeep = options.scrubSpecificQueryParam.some(specificQueryParam => 
                    specificQueryParam.toLowerCase() === param[0].toLowerCase());
                //console.log(`Checking query parameter ${param[0]}: Keep? ${shouldKeep}`);
                if (!shouldKeep) {
                    url.searchParams.delete(param[0]);
                }
            }
        
            // Update the request.url with the modified URL
            request.url = url.toString();
            //console.log('Final URL after keeping specific query parameters: ', request.url);
        } else {
            // Clear all query parameters
            const url = new URL(request.url);
            url.search = '';
            request.url = url.toString();
            //console.log('Cleared all query parameters from URL: ', request.url);
        }
        request.url = url.toString();
        //console.log('Final URL after scrubbing all query parameters: ', request.url);
    } else if (options.scrubSpecificQueryParam) {
        //console.log('Scrubbing specific query parameters:', options.scrubSpecificQueryParam);
        const url = new URL(request.url);
        
        // Filter the queryString array
        request.queryString = request.queryString.filter(param => {
            const shouldRemove = options.scrubSpecificQueryParam?.some(specificQueryParam => 
                specificQueryParam.toLowerCase() === param.name.toLowerCase());
            //console.log(`Checking query parameter ${param.name}: Remove? ${shouldRemove}`);
    
            // Reflect the removal in the actual URL
            if (shouldRemove) {
                url.searchParams.delete(param.name);
            }
            return !shouldRemove;
        });
    
        // Update the request URL
        request.url = url.toString();
        //console.log('Final URL after scrubbing specific query parameters: ', request.url);
        //console.log('Final queryString after scrubbing specific: ', request.queryString);
    }
    

    // Handling post parameters
    if (request.postData) {
        // Scrubbing postData.params if they exist
        if (request.postData.params) {
            if (options.scrubAllPostParams) {
                if (options.scrubSpecificPostParam) {
                    request.postData.params = request.postData.params.filter(param => {
                        return options.scrubSpecificPostParam?.some(specificPostParam => 
                            specificPostParam.toLowerCase() === param.name.toLowerCase());
                    });
                } else {
                    request.postData.params = [];
                }
            } else if (options.scrubSpecificPostParam) {
                request.postData.params = request.postData.params.filter(param => {
                    return !options.scrubSpecificPostParam?.some(specificPostParam => 
                        specificPostParam.toLowerCase() === param.name.toLowerCase());
                });
            }
        }

        // Handling form data with MIME type application/x-www-form-urlencoded
        if (request.postData.mimeType === 'application/x-www-form-urlencoded') {
            let formDataParams = new URLSearchParams(request.postData.text);
            let keysToDelete: string[] = [];
        
            formDataParams.forEach((value, key) => {
                if (options.scrubAllPostParams) {
                    if (options.scrubSpecificPostParam && options.scrubSpecificPostParam.includes(key.toLowerCase())) {
                        // Keep param if it's in the specific list
                    } else {
                        // Delete param if it's not in the specific list
                        keysToDelete.push(key);
                    }
                } else if (options.scrubSpecificPostParam && options.scrubSpecificPostParam.includes(key.toLowerCase())) {
                    // Delete param if it's in the specific list
                    keysToDelete.push(key);
                }
            });
        
            keysToDelete.forEach(key => formDataParams.delete(key));
            
            request.postData.text = formDataParams.toString();
        }
    
    }

    

    // Handling MIME types
    if (options.scrubSpecificMimeTypes && request.postData) {
        //console.log('Checking for specific MIME types to scrub in postData');
        const mimeType = request.postData.mimeType.toLowerCase();
        //console.log(`PostData MIME type: ${mimeType}`);
    
        const shouldRedact = options.scrubSpecificMimeTypes.some(specificMimeType => 
            specificMimeType.toLowerCase() === mimeType);
    
        //console.log(`Should redact content due to MIME Type? ${shouldRedact}`);
    
        if (shouldRedact) {
            request.postData.text = '[Content Redacted due to MIME Type]';
        }
    }
    
}

function sanitizeResponse(response: Response, options: SanitizeOptions = {}) {
    // Handling response headers
    if (options.scrubAllResponseHeaders) {
        //console.log('Scrubbing all response headers');
        response.headers = options.scrubSpecificResponseHeader ? 
            response.headers.filter(header => {
                const shouldKeep = options.scrubSpecificResponseHeader?.some(specificResponseHeader => 
                    specificResponseHeader.toLowerCase() === header.name.toLowerCase());
                //console.log(`Checking response header ${header.name}: Keep? ${shouldKeep}`);
                return shouldKeep;
            }) : [];
        //console.log('Final response headers after scrubbing all: ', response.headers);
    } else if (options.scrubSpecificResponseHeader) {
        //console.log('Scrubbing specific response headers:', options.scrubSpecificResponseHeader);
        response.headers = response.headers.filter(header => {
            const shouldRemove = options.scrubSpecificResponseHeader?.some(specificResponseHeader => 
                specificResponseHeader.toLowerCase() === header.name.toLowerCase());
            //console.log(`Checking response header ${header.name}: Remove? ${shouldRemove}`);
            return !shouldRemove;
        });
        //console.log('Final response headers after scrubbing specific: ', response.headers);
    }

    // Handling Set-Cookie headers in response
    if (options.scrubAllCookies) {
        // Scrub all Set-Cookie headers
        //console.log('removing all set-cookie headers');
        response.headers = response.headers.filter(header => header.name.toLowerCase() !== 'set-cookie');
    } else if (options.scrubSpecificCookie) {
        // Scrub specific Set-Cookie headers
        response.headers = response.headers.map(header => {
            if (header.name.toLowerCase() === 'set-cookie') {
                const cookieName = header.value.split('=')[0]; // Extract the cookie name
                //console.log(cookieName);
                const shouldRemove = options.scrubSpecificCookie?.some(
                    specificCookie => {
                        //console.log('cookie', specificCookie);
                        return specificCookie.toLowerCase() === cookieName.toLowerCase();
                    }
                );
                //console.log('shouldRemove ', shouldRemove);
                return shouldRemove ? null : header; // Mark header for removal if it matches the specific cookies list
            }
            return header;
        }).filter(header => header !== null) as Header[]; // Remove marked headers (null) from the headers array
    }
    

    // Handling response body contents and MIME types
    if (response.content) {
        //console.log('Checking response content for redaction');
    
        if (options.scrubAllBodyContents) {
            //console.log('Redacting all body contents');
            response.content.text = '[Content Redacted]';
        } else if (options.scrubSpecificMimeTypes) {
            //console.log('Checking for specific MIME types to scrub in response content');
            const mimeType = response.content.mimeType.toLowerCase();
            //console.log(`Response content MIME type: ${mimeType}`);
    
            const shouldRedact = options.scrubSpecificMimeTypes.some(specificMimeType => 
                specificMimeType.toLowerCase() === mimeType);
    
            //console.log(`Should redact content due to MIME Type? ${shouldRedact}`);
    
            if (shouldRedact) {
                response.content.text = '[Content Redacted due to MIME Type]';
            }
        }
    
        //console.log('Final response content after possible redactions: ', response.content.text);
    }
}
