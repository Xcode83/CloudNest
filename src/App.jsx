import { useState, useEffect, useCallback } from 'react';
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import './App.css';

// --- Helper Icons ---
const FolderIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.22A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"></path></svg> );
const FileIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> );
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );

function App() {
  const [credentials, setCredentials] = useState(null);
  const [s3Client, setS3Client] = useState(null);
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const listItems = useCallback(async (client, bucket, path) => {
    if (!client) return;
    setLoading(true);
    setError('');
    try {
      const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: path, Delimiter: '/' });
      const response = await client.send(command);
      const folders = (response.CommonPrefixes || []).map(p => ({ name: p.Prefix.replace(path, '').replace('/', ''), type: 'folder', path: p.Prefix }));
      const files = (response.Contents || []).filter(item => item.Key !== path).map(item => ({ name: item.Key.replace(path, ''), type: 'file', size: item.Size, lastModified: item.LastModified, key: item.Key }));
      setItems([...folders, ...files].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      handleAWSError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (s3Client && credentials) {
      listItems(s3Client, credentials.bucketName, currentPath);
    }
  }, [s3Client, currentPath, credentials, listItems]);

  const handleAWSError = (err) => {
    console.error("AWS Error:", err);
    if (err.name === 'NoSuchBucket') {
      setError(`Bucket "${credentials.bucketName}" not found or does not exist.`);
    } else if (err.name === 'InvalidAccessKeyId' || err.name === 'SignatureDoesNotMatch') {
      setError('Connection failed. Your Access Key or Secret Key is incorrect.');
      handleDisconnect();
    } else {
      setError('An AWS error occurred. Check the browser console for details.');
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const creds = Object.fromEntries(formData.entries());
    if (!creds.accessKeyId || !creds.secretAccessKey || !creds.region || !creds.bucketName) {
      setError('All fields are required.');
      return;
    }
    setCredentials(creds);
    const client = new S3Client({
      region: creds.region,
      credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey }
    });
    setS3Client(client);
    setCurrentPath('');
  };

  const handleDisconnect = () => {
    setCredentials(null);
    setS3Client(null);
    setItems([]);
    setCurrentPath('');
    setError('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !s3Client) return;
    setUploading(true);
    setError('');
    try {
      await new Upload({
        client: s3Client,
        params: { Bucket: credentials.bucketName, Key: `${currentPath}${file.name}`, Body: file },
      }).done();
      await listItems(s3Client, credentials.bucketName, currentPath);
    } catch (err) { handleAWSError(err); } finally { setUploading(false); }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter new folder name:');
    if (!folderName || !/^[a-zA-Z0-9_-\s]+$/.test(folderName)) {
      if(folderName) alert('Invalid folder name. Use letters, numbers, spaces, hyphens, and underscores.');
      return;
    }
    setLoading(true);
    try {
      await s3Client.send(new PutObjectCommand({ Bucket: credentials.bucketName, Key: `${currentPath}${folderName.trim()}/` }));
      await listItems(s3Client, credentials.bucketName, currentPath);
    } catch (err) { handleAWSError(err); } finally { setLoading(false); }
  };
  
  const handleDownload = async (item) => {
    if (item.type === 'folder') {
        alert("Folder download is not supported. Please download files individually.");
        return;
    }
    try {
        const command = new GetObjectCommand({ Bucket: credentials.bucketName, Key: item.key });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        window.open(url, '_blank');
    } catch (err) {
        handleAWSError(err);
    }
  };

  const handleDelete = async (item) => {
    const confirmation = window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`);
    if (!confirmation) return;
    setLoading(true);
    try {
        if (item.type === 'file') {
            await s3Client.send(new DeleteObjectCommand({ Bucket: credentials.bucketName, Key: item.key }));
        } else if (item.type === 'folder') {
            const listCommand = new ListObjectsV2Command({ Bucket: credentials.bucketName, Prefix: item.path });
            const listedObjects = await s3Client.send(listCommand);
            if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
                 await s3Client.send(new DeleteObjectCommand({ Bucket: credentials.bucketName, Key: item.path }));
            } else {
                const deleteKeys = listedObjects.Contents.map(obj => ({ Key: obj.Key }));
                await s3Client.send(new DeleteObjectsCommand({ Bucket: credentials.bucketName, Delete: { Objects: deleteKeys } }));
            }
        }
        await listItems(s3Client, credentials.bucketName, currentPath);
    } catch (err) {
        handleAWSError(err);
    } finally {
        setLoading(false);
    }
  };

  if (!s3Client) {
    return (
      <div className="login-container">
        <form onSubmit={handleConnect} className="login-form">
          <h2>CloudNest</h2>
          <p>Connect to your S3 Bucket</p>
          <input name="accessKeyId" type="password" placeholder="Your AWS Access Key ID" required />
          <input name="secretAccessKey" type="password" placeholder="Your AWS Secret Access Key" required />
          <input name="region" type="text" placeholder="Bucket Region (e.g., us-east-1)" required />
          <input name="bucketName" type="text" placeholder="Your Bucket Name" required />
          <button type="submit">Connect Securely</button>
          {error && <p className="error-message">{error}</p>}
          <div className="security-warning">
            <strong>Security Notice:</strong>
            <ul>
              <li>Your credentials are only held in your browser's memory for this session.</li>
              <li>They are NEVER stored or sent to any server but AWS.</li>
              <li>Closing this page will permanently delete them from memory.</li>
              <li>Always ensure the URL is correct and the connection is secure (HTTPS).</li>
            </ul>
          </div>
        </form>
      </div>
    );
  }

  const breadcrumbs = ['root', ...currentPath.split('/').filter(Boolean)];

  return (
    <div className="storage-container">
      <header className="storage-header">
        <h1 className="storage-title">CloudNest</h1>
        <div className="header-controls">
            <span className="bucket-name">{credentials.bucketName}</span>
            <button onClick={handleDisconnect} className="disconnect-btn">Disconnect</button>
        </div>
      </header>

      <div className="action-bar">
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => {
            const path = breadcrumbs.slice(1, index + 1).join('/');
            return ( <span key={index}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPath(path ? `${path}/` : ''); }}>{crumb}</a>
                {index < breadcrumbs.length - 1 && ' / '}
              </span> );
          })}
        </div>
        <button onClick={handleCreateFolder} className="new-folder-btn">+ New Folder</button>
      </div>

      <div className="upload-area">
        <input type="file" id="file-upload" onChange={handleFileUpload} disabled={uploading} />
        <label htmlFor="file-upload">{uploading ? `Uploading...` : 'Drop files or click to upload'}</label>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="file-list">
        <div className="file-list-header">
          <span>Name</span>
          <span>Size</span>
          <span>Last Modified</span>
          <span>Actions</span>
        </div>
        {loading ? <div className="loading-text">Loading items...</div> : (
          items.map(item => (
            <div key={item.path || item.key} className="file-list-item">
              <div className="item-name" onClick={() => item.type === 'folder' && setCurrentPath(item.path)}>
                {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                <span>{item.name}</span>
              </div>
              <span>{item.type === 'file' ? `${(item.size / 1024).toFixed(2)} KB` : '—'}</span>
              <span>{item.type === 'file' ? new Date(item.lastModified).toLocaleDateString() : '—'}</span>
              <div className="item-actions">
                  <button onClick={() => handleDownload(item)} className="action-btn download-btn" title="Download" disabled={item.type === 'folder'}>
                      <DownloadIcon />
                  </button>
                  <button onClick={() => handleDelete(item)} className="action-btn delete-btn" title="Delete">
                      <DeleteIcon />
                  </button>
              </div>
            </div>
          ))
        )}
        {!loading && items.length === 0 && <div className="empty-folder">This folder is empty.</div>}
      </div>
    </div>
  );
}

export default App;