import React, { useState, useRef } from 'react';
import Toggle from '@atlaskit/toggle';
import Page from '@atlaskit/page';
import { Grid } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { token } from '@atlaskit/tokens';
import TagGroup from '@atlaskit/tag-group';
import Tag from '@atlaskit/tag';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import TrashIcon from '@atlaskit/icon/glyph/trash'
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle'
import { sanitizeHar,
    defaultRequestHeadersList, 
    defaultCookiesList, 
    defaultQueryPostParamsList, 
    defaultResponseHeadersList, 
    defaultMimeTypesList } from 'har-cleaner';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';


const defaultSettings = {
    'scrubAllRequestHeaders': false,
    'scrubSpecificHeader': defaultRequestHeadersList,
    'scrubAllCookies': false,
    'scrubSpecificCookie': defaultCookiesList,
    'scrubAllQueryParams': false,
    'scrubSpecificQueryParam': defaultQueryPostParamsList,
    'scrubAllPostParams': false,
    'scrubSpecificPostParam': defaultQueryPostParamsList,
    'scrubAllResponseHeaders': false,
    'scrubSpecificResponseHeader': defaultResponseHeadersList,
    'scrubAllBodyContents': false,
    'scrubSpecificMimeTypes': defaultMimeTypesList
};

function CustomLabel({ htmlFor, children, style }) {
    return (
        <label htmlFor={htmlFor} style={style}>
            {children}
        </label>
    );
}




const validateInput = (inputValue, existingValues, type) => {

    switch (type) {
        case 'header':
        case 'postParam':
            // Only allow A-Z, a-z, 0-9, hyphen (-), and underscore (_)
            return /^[A-Za-z0-9-_]+$/.test(inputValue);
        case 'cookie':
            // Allow printable ASCII except for control characters, spaces, tabs, and separators
            return /^[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]+$/.test(inputValue);
        case 'queryArg':
            // Only allow A-Z, a-z, 0-9, hyphen (-), and underscore (_)
            return /^[A-Za-z0-9-_]+$/.test(inputValue);
        case 'mimeType':
            // Basic validation for MIME types
            return /^[A-Za-z0-9-/+]+$/.test(inputValue);
        default:
            return false;
    }
};


function TagManager({
    tagData,
    onAddTag,
    onRemoveTag,
    subHeading,
    subDescription,
    type
}) {
    const [inputValue, setInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(''); // New state for error message

    const handleAddTagClick = () => {
        setIsAdding(true);
        setError('');
    };

    const handleAddTagInternal = () => {
        if (inputValue.trim() && validateInput(inputValue, tagData, type)) {
            onAddTag(inputValue);
            setInputValue('');
            setIsAdding(false);
        } else {
            setError('Invalid input'); // Set an error message
        }
    };

    // Update the handleInputChange function
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (!validateInput(e.target.value, tagData, type)) {
            setError('Invalid input');
        } else {
            setError('');
        }
    };

    const handleCancel = () => {
        setInputValue('');
        setIsAdding(false);
        setError(''); // Clear error message on cancel
    };

    const tagInputStyle = {
        display: 'flex',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: token('space.500', '40px')
    };

    const subHeadingStyle = {
        fontSize: '14px',
        fontWeight: 'bold',
        marginTop: '10px'
    };

    const subDescriptionStyle = {
        fontSize: '14px',
        color: 'grey',
        marginTop: '5px'
    };

    const buttonStyle = {
        marginLeft: '10px', // Spacing between buttons and input field
    };

    const addTagButtonStyle = {
        marginTop: '20px',
        appearance: isAdding ? 'primary' : 'initial',
    };

    const headingRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Aligns items to start and end of the container
        marginBottom: '10px' // Adjust as needed
    };

    return (
        <div>
            <div style={headingRowStyle}>
                {subHeading && <div style={subHeadingStyle}>{subHeading}</div>}
                {!isAdding && (
                    <Button onClick={handleAddTagClick}
                        style={addTagButtonStyle}
                        iconAfter={<AddCircleIcon label="" size="small" />}
                    >
                        Add
                    </Button>
                )}
            </div>
            {subDescription && <div style={subDescriptionStyle}>{subDescription}</div>}
            <TagGroup>
                {tagData.map((tag) => (
                    <Tag
                        key={tag}
                        text={tag}
                        onAfterRemoveAction={() => onRemoveTag(tag)}
                        removeButtonText="Remove tag"
                    />
                ))}
            </TagGroup>
            {isAdding && (
                <div>
                    <div style={tagInputStyle}>
                        <TextField
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Add a tag"
                            autoFocus
                        />
                        <Button style={buttonStyle} onClick={handleAddTagInternal} isDisabled={!inputValue.trim()}>Add</Button>
                        <Button style={buttonStyle} onClick={handleCancel}>X</Button>
                    </div>
                    {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>} {/* Display error message */}
                </div>
            )}
        </div>
    );
}


function ToggleWithLabel({
    label,
    checked,
    onChange,
    id,
    description,
}) {

    const labelStyle = {
        flexGrow: 1,
        marginRight: token('space.100', '8px'),
        fontSize: '16px', // adjust as needed
        fontWeight: 'bold', // adjust as needed
    };

    const toggleWrapperStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    const toggleRowStyle = {
        display: 'flex',
        alignItems: 'center',
    };

    const descriptionStyle = {
        fontSize: token('space.150', '14px'),
        color: token('color.text.accent.gray', '#6B778C'),
    };

    return (
        <div style={toggleWrapperStyle}>
            <div style={toggleRowStyle}>
                <CustomLabel htmlFor={id} style={labelStyle}>{label}</CustomLabel>
                <Toggle id={id} isChecked={checked} onChange={onChange} />
            </div>
            <p style={descriptionStyle}>{description}</p>
        </div>
    );
}

function App() {

    const inputRef = useRef(null);


    const exportSettings = () => {
        const fileName = "scrubbing-settings.json";
        const json = JSON.stringify(settings, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const href = URL.createObjectURL(blob);
    
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const text = await file.text();
            try {
                const importedSettings = JSON.parse(text);
                // Validate and set the imported settings
                setSettings(importedSettings);
            } catch (error) {
                console.error("Error importing settings:", error);
                // Handle error (e.g., show an alert to the user)
            }
        }
    };

    const [settings, setSettings] = useState(defaultSettings); // Initialize with defaults from the library
    const [scrubbedFiles, setScrubbedFiles] = useState([]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            console.log("Files dropped:", acceptedFiles); // Debugging: Check the dropped files
            try {
                const scrubbedFiles = await Promise.all(acceptedFiles.map(async (file) => {
                    console.log("Processing file:", file.name); // Debugging: Check each file being processed
                    const harContent = await file.text();
                    console.log("File content loaded"); // Debugging: Confirm file content is loaded
                    const harObject = JSON.parse(harContent);
                    const scrubbedHar = sanitizeHar(harObject, settings);
                    console.log("File sanitized"); // Debugging: Confirm sanitization
                    const blob = new Blob([JSON.stringify(scrubbedHar, null, 2)], { type: 'application/json' });
                    return { blob, name: `cleaned-${file.name}` };
                }));
                setScrubbedFiles(scrubbedFiles);
                console.log("Files processed:", scrubbedFiles); // Debugging: Check the processed files
            } catch (error) {
                console.error("Error processing files:", error); // Debugging: Catch any errors
            }
        },
        accept: {
            'application/json': ['.har'],
          },
        multiple: true
    });
    
    const downloadSingleFile = (file) => {
        const url = window.URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllFiles = async () => {
        const zip = new JSZip();
        scrubbedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'scrubbed_files.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleChange = (key, event) => {
        const newValue = event.target.checked;
        setSettings(prevSettings => ({ ...prevSettings, [key]: newValue }));
    };

    // Function to handle addition of a tag
    const handleAddTag = async (key, newTag) => {
        const currentTags = Array.isArray(settings[key]) ? settings[key] : [];

        // Check if the tag already exists
        if (!currentTags.includes(newTag)) {
            const updatedTags = [...currentTags, newTag];
            setSettings(prevSettings => ({ ...prevSettings, [key]: updatedTags }));
        } else {
            // Optionally, provide feedback to the user that the tag already exists
            console.log("Tag already exists:", newTag);
            // Or use a UI element to show a message
        }
    };

    const handleRemoveTag = async (key, tagToRemove) => {
        const currentTags = Array.isArray(settings[key]) ? settings[key] : [];
        const updatedTags = currentTags.filter(tag => tag !== tagToRemove);

        console.log(`Before state update:`, settings[key]); // Log current state
        console.log(`Removing tag:`, tagToRemove);
        console.log(`Updated tags:`, updatedTags); // Log updated tags

        // Update the state
        setSettings(prevSettings => ({ ...prevSettings, [key]: updatedTags }));
    };

    const handleResetToDefaults = async () => {
        setSettings(defaultSettings);
    };

    return (
        <Page>
            <div style={{ maxWidth: '800px', margin: '0 auto', marginTop: '40px' }}>

                <Grid templateColumns="1fr" gap="space.200">
                
                    <Grid templateColumns="repeat(2, 1fr)" gap="space.200">
                        <Heading level="h600">Securely HAR Cleaner by <a href="https://abrega.com/">Abrega</a></Heading>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}> {/* Aligns iframe to the right */}
                            <iframe 
                                src="https://ghbtns.com/github-btn.html?user=AbregaInc&repo=har-cleaner&type=star&count=true" 
                                frameBorder="0" 
                                scrolling="0" 
                                width="78" 
                                height="20" 
                                title="GitHub"
                            ></iframe>
                        </div>
                    </Grid>
                    <div className="banner">
                        <p>All data processing happens 100% within the browser.<br /> 
                        This page doesn't have any analytics or anything like that.<br />
                        Check out the full code <a href="https://github.com/AbregaInc/har-cleaner/tree/main/web">here</a>.<br /><br />
                        If you need this functionality within your Jira instance, check out:<br />
                        <a href="https://marketplace.atlassian.com/apps/1232593/securely-for-jira-har-cleaner-compliance-automation-free?hosting=cloud&tab=overview">Securely for Jira</a>.
</p>
                    </div>
                    <Grid templateColumns="repeat(2, 1fr)" gap="space.200">
                        <div>             
                            <p style={{ marginBottom: token('space.500', '40px') }}>
                                By default, the Securely HAR Cleaner will scrub portions of a HAR file based on the configuration below. You can read about this in <a href="https://abrega.gitbook.io/securely/secure-har-file-management-with-securely/what-is-sanitized">our documentation</a>.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}> {/* Added gap for spacing between buttons */}
                            <div style={{ alignSelf: 'stretch', textAlign: 'right' }}>
                                <Button onClick={handleResetToDefaults} iconAfter={<TrashIcon label="" size="small" />}>
                                    Reset All Settings to Default
                                </Button>
                            </div>
                            <div style={{ alignSelf: 'stretch', textAlign: 'right' }}>
                                <Button onClick={exportSettings}>
                                    Export Settings
                                </Button>
                            </div>
                            <div style={{ alignSelf: 'stretch', textAlign: 'right' }}>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    ref={inputRef} // Create this ref using useRef
                                    onChange={handleFileUpload}
                                    accept=".json"
                                />
                                <Button onClick={() => inputRef.current.click()}>
                                    Import Settings
                                </Button>
                            </div>
                        </div>

                    </Grid>
                    <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '10px', textAlign: 'center' }}>
                        <input {...getInputProps()} />
                        {isDragActive ? 
                            <p>Drop the HAR files here...</p> : 
                            <p>Drag 'n' drop HAR files here, or click to select files</p>
                        }
                    </div>
                    {scrubbedFiles.length > 0 && (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            {scrubbedFiles.length === 1 ? (
                                <Button appearance="primary" onClick={() => downloadSingleFile(scrubbedFiles[0])}>
                                    Download cleaned file
                                </Button>
                            ) : (
                                <Button appearance="primary" onClick={downloadAllFiles}>
                                    Download all cleaned files
                                </Button>
                            )}
                            <Button onClick={() => setScrubbedFiles([])} appearance="subtle" style={{ marginLeft: '10px' }}>
                                Reset
                            </Button>
                        </div>
                    )}
                    <ToggleWithLabel
                        label="Remove all request headers"
                        checked={settings.scrubAllRequestHeaders}
                        onChange={(e) => handleChange('scrubAllRequestHeaders', e)}
                        id="scrubAllRequestHeaders"
                        description="HTTP headers contain metadata about the request or response, or about the object sent in the message body. Examples include Content-Type to describe the data format, Authorization for credentials, and User-Agent for client information."
                    />

                    <TagManager
                        tagData={settings.scrubSpecificHeader}
                        type="header"
                        onAddTag={(tag) => handleAddTag('scrubSpecificHeader', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificHeader', tag)}
                        subHeading={settings.scrubAllRequestHeaders ? "Exclude these request headers" : "Only remove these request headers"}
                        subDescription={settings.scrubAllRequestHeaders ? "Removes all request headers except the ones listed below:" : "Removes only the request headers listed below:"}
                    />

                    <hr />

                    <ToggleWithLabel
                        label="Remove all response headers"
                        checked={settings.scrubAllResponseHeaders}
                        onChange={(e) => handleChange('scrubAllResponseHeaders', e)}
                        id="scrubAllResponseHeaders"
                        description="HTTP headers contain metadata about the request or response, or about the object sent in the message body. Examples include Content-Type to describe the data format, Authorization for credentials, and User-Agent for client information."
                    />
                    <TagManager
                        tagData={settings.scrubSpecificResponseHeader}
                        type="header"
                        onAddTag={(tag) => handleAddTag('scrubSpecificResponseHeader', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificResponseHeader', tag)}
                        subHeading={settings.scrubAllResponseHeaders ? "Exclude these response headers" : "Only remove these response headers"}
                        subDescription={settings.scrubAllResponseHeaders ? "Removes all request response except the ones listed below:" : "Removes only the response headers listed below:"}
                    />

                    <hr />
                    <ToggleWithLabel
                        label="Remove all cookies"
                        checked={settings.scrubAllCookies}
                        onChange={(e) => handleChange('scrubAllCookies', e)}
                        id="scrubAllCookies"
                        description="Cookies are small pieces of data stored on the client side, which are sent to the server with each HTTP request. They are used to remember stateful information for the user between page requests, such as login status or preferences."
                    />
                    <TagManager
                        tagData={settings.scrubSpecificCookie}
                        type="cookie"
                        onAddTag={(tag) => handleAddTag('scrubSpecificCookie', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificCookie', tag)}
                        subHeading={settings.scrubAllCookies ? "Exclude these cookies" : "Only remove these cookies"}
                        subDescription={settings.scrubAllCookies ? "Removes all cookies except the ones listed below:" : "Removes only the cookies listed below:"}
                    />
                    <hr />

                    <ToggleWithLabel
                        label="Remove all query arguments"
                        checked={settings.scrubAllQueryParams}
                        onChange={(e) => handleChange('scrubAllQueryParams', e)}
                        id="scrubAllQueryParams"
                        description="Query arguments are part of the URL that provide additional parameters to the request. Starting with a ? symbol in the URL, they are formatted as key-value pairs separated by &, for example, ?search=query&sort=asc."
                    />
                    <TagManager
                        tagData={settings.scrubSpecificQueryParam}
                        type="queryArg"
                        onAddTag={(tag) => handleAddTag('scrubSpecificQueryParam', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificQueryParam', tag)}
                        subHeading={settings.scrubAllQueryParams ? "Exclude these query arguments" : "Only remove these query arguments"}
                        subDescription={settings.scrubAllQueryParams ? "Removes all query arguments except the ones listed below:" : "Removes only the query arguments listed below:"}
                    />
                    <hr />

                    <ToggleWithLabel
                        label="Remove all POST parameters"
                        checked={settings.scrubAllPostParams}
                        onChange={(e) => handleChange('scrubAllPostParams', e)}
                        id="scrubAllPostParams"
                        description="POST parameters are included in the body of an HTTP POST request. They are used to send data to the server to be processed, such as form submissions or file uploads. Unlike query arguments, POST parameters are not visible in the URL."
                    />
                    <TagManager
                        tagData={settings.scrubSpecificPostParam}
                        type="postParam"
                        onAddTag={(tag) => handleAddTag('scrubSpecificPostParamm', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificPostParam', tag)}
                        subHeading={settings.scrubSpecificPostParam ? "Exclude these POST parameters" : "Only remove these POST parameters"}
                        subDescription={settings.scrubAllPostParams ? "Removes all POST parameters except the ones listed below:" : "Removes only the POST parameters listed below:"}
                    />
                    <hr />
                    <ToggleWithLabel
                        label="Remove the whole response body"
                        checked={settings.scrubAllBodyContents}
                        onChange={(e) => handleChange('scrubAllBodyContents', e)}
                        id="scrubAllBodyContents"
                        description="The response body often contains the bulk of the data returned by a request, including HTML, JSON, XML, or other formats. Removing it can prevent sensitive data exposure, particularly in responses that include user or application data."
                    />
                    <TagManager
                        tagData={settings.scrubSpecificMimeTypes}
                        type="mimeType"
                        onAddTag={(tag) => handleAddTag('scrubSpecificMimeTypes', tag)}
                        onRemoveTag={(tag) => handleRemoveTag('scrubSpecificMimeTypes', tag)}
                        subHeading={settings.scrubAllBodyContents ? "Exclude responses with these MIME Types" : "Only remove responses with these MIME Types"}
                        subDescription={settings.scrubAllBodyContents ? "Removes all responses with MIME Types except the ones listed below:" : "Removes only the responses with the MIME Types listed below:"}
                    />
                </Grid>
            </div>
        </Page>
    );
}

export default App;
