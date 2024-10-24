// src/components/UploadInvoices/UploadInvoices.js
import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import './UploadInvoices.css';

const UploadInvoices = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file => 
            file.type === 'application/pdf' || file.type.startsWith('image/')
        );

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            createPreviews(validFiles);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => 
            file.type === 'application/pdf' || file.type.startsWith('image/')
        );
        setFiles(prev => [...prev, ...validFiles]);
        createPreviews(validFiles);
    };

    const createPreviews = (filesToPreview) => {
        filesToPreview.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    file.preview = e.target.result;
                    // Forzar actualización del estado para mostrar la vista previa
                    setFiles(prev => [...prev]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeFile = (fileToRemove) => {
        setFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage({
                text: 'Por favor, selecciona al menos una factura para subir.',
                type: 'error'
            });
            return;
        }

        setUploading(true);
        setMessage({ text: '', type: '' });

        try {
            const user = await getCurrentUser();
            const userId = user.userId;

            const uploadPromises = files.map(file => {
                const timestamp = Date.now();
                const filename = `invoices/${userId}/${timestamp}_${file.name}`;
                return uploadData({
                    key: filename,
                    data: file,
                    options: {
                        contentType: file.type,
                        metadata: {
                            userId: userId,
                            uploadDate: new Date().toISOString()
                        }
                    }
                }).result;
            });

            await Promise.all(uploadPromises);

            setMessage({
                text: '¡Facturas subidas exitosamente!',
                type: 'success'
            });
            setFiles([]);
        } catch (error) {
            console.error('Error subiendo archivos:', error);
            setMessage({
                text: 'Error subiendo archivos. Por favor, intenta nuevamente.',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <div className="upload-card">
                <h1 className="upload-title">Digitalizar Facturas</h1>

                <div
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <div className="dropzone-icon">📄</div>
                    <p className="dropzone-title">
                        Arrastra tus facturas aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Formatos aceptados: PDF, JPG, PNG
                    </p>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {files.length > 0 && (
                    <div className="preview-container">
                        {files.map((file, index) => (
                            <div key={index} className="preview-item">
                                {file.type.startsWith('image/') ? (
                                    <img src={file.preview} alt="Preview" />
                                ) : (
                                    <div className="preview-pdf">
                                        <div className="preview-pdf-icon">📄</div>
                                    </div>
                                )}
                                <div className="preview-name">{file.name}</div>
                                <button
                                    className="remove-button"
                                    onClick={() => removeFile(file)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                >
                    {uploading ? 'Subiendo...' : 'Subir Facturas'}
                </button>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {uploading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadInvoices;