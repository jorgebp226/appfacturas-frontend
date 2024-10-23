import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import './UploadInvoices.css';

const UploadInvoices = () => {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handlePdfChange = (e) => {
        setPdfFiles([...e.target.files]);
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (pdfFiles.length === 0 || !imageFile) {
            setMessage('Por favor, selecciona al menos una factura y una imagen del menú.');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            // Subir archivos PDF
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

            setMessage('Archivos subidos exitosamente.');
            setPdfFiles([]);
            setImageFile(null);
        } catch (error) {
            console.error('Error subiendo archivos:', error);
            setMessage('Error subiendo archivos. Por favor, intenta nuevamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>Subir Facturas</h2>
            <div className="upload-section">
                <label htmlFor="pdf-upload">Selecciona Facturas (PDF o Imagen):</label>
                <input
                    type="file"
                    id="pdf-upload"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handlePdfChange}
                />
            </div>
            <div className="upload-section">
                <label htmlFor="menu-upload">Selecciona una Imagen del Menú:</label>
                <input
                    type="file"
                    id="menu-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Subir Facturas'}
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default UploadInvoices;