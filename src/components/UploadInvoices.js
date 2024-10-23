import React, { useState, useCallback } from 'react';
import { uploadData } from 'aws-amplify/storage';
import './UploadInvoices.css';

const UploadInvoices = () => {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleInvoiceDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(file => 
            file.type === 'application/pdf' || file.type.startsWith('image/')
        );

        if (validFiles.length > 0) {
            setPdfFiles(prev => [...prev, ...validFiles]);
            createPreviews(validFiles);
        }
    };

    const handleMenuDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        const validFile = files.find(file => file.type.startsWith('image/'));

        if (validFile) {
            setImageFile(validFile);
            createMenuPreview(validFile);
        }
    };

    const handleInvoiceSelect = (e) => {
        const files = Array.from(e.target.files);
        setPdfFiles(prev => [...prev, ...files]);
        createPreviews(files);
    };

    const handleMenuSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            createMenuPreview(file);
        }
    };

    const createPreviews = (files) => {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = e.target.result;
                    file.preview = preview;
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const createMenuPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            file.preview = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const removeFile = (fileToRemove, type) => {
        if (type === 'invoice') {
            setPdfFiles(pdfFiles.filter(file => file !== fileToRemove));
        } else {
            setImageFile(null);
        }
    };

    const handleUpload = async () => {
        if (pdfFiles.length === 0 || !imageFile) {
            setMessage({
                text: 'Por favor, selecciona al menos una factura y una imagen del menú.',
                type: 'error'
            });
            return;
        }

        setUploading(true);
        setMessage({ text: '', type: '' });

        try {
            // Subir archivos PDF/imágenes de facturas
            const uploadPromises = pdfFiles.map(file => {
                const filename = `invoices/${Date.now()}_${file.name}`;
                return uploadData({
                    key: filename,
                    data: file,
                    options: {
                        contentType: file.type
                    }
                }).result;
            });

            // Subir imagen del menú
            const menuFilename = `menus/${Date.now()}_${imageFile.name}`;
            uploadPromises.push(
                uploadData({
                    key: menuFilename,
                    data: imageFile,
                    options: {
                        contentType: imageFile.type
                    }
                }).result
            );

            await Promise.all(uploadPromises);

            setMessage({
                text: '¡Archivos subidos exitosamente!',
                type: 'success'
            });
            setPdfFiles([]);
            setImageFile(null);
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
                <h1 className="upload-title">Subir Facturas y Menú</h1>

                {/* Dropzone para Facturas */}
                <div className="section-title">Facturas (PDF o Imágenes)</div>
                <div
                    className="dropzone"
                    onDrop={handleInvoiceDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('invoice-input').click()}
                >
                    <div className="dropzone-icon">📄</div>
                    <p className="dropzone-title">
                        Arrastra tus facturas aquí o haz clic para seleccionar
                    </p>
                    <input
                        id="invoice-input"
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        onChange={handleInvoiceSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Dropzone para Menú */}
                <div className="section-title">Imagen del Menú</div>
                <div
                    className="dropzone"
                    onDrop={handleMenuDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('menu-input').click()}
                >
                    <div className="dropzone-icon">🖼️</div>
                    <p className="dropzone-title">
                        Arrastra la imagen del menú aquí o haz clic para seleccionar
                    </p>
                    <input
                        id="menu-input"
                        type="file"
                        accept="image/*"
                        onChange={handleMenuSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Previsualización de Facturas */}
                {pdfFiles.length > 0 && (
                    <div className="preview-container">
                        {pdfFiles.map((file, index) => (
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
                                    onClick={() => removeFile(file, 'invoice')}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Previsualización del Menú */}
                {imageFile && (
                    <div className="preview-container">
                        <div className="preview-item">
                            <img src={imageFile.preview} alt="Menu preview" />
                            <div className="preview-name">{imageFile.name}</div>
                            <button
                                className="remove-button"
                                onClick={() => removeFile(imageFile, 'menu')}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <button
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={uploading || pdfFiles.length === 0 || !imageFile}
                >
                    {uploading ? 'Subiendo...' : 'Subir Archivos'}
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