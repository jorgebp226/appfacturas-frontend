import React, { useState, useCallback } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const UploadInvoices = () => {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [previews, setPreviews] = useState([]);

    const onPdfDrop = useCallback((acceptedFiles) => {
        const newPreviews = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: 'pdf'
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
        setPdfFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const onImageDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const preview = URL.createObjectURL(file);
            setImageFile(file);
            setPreviews(prev => [...prev, { file, preview, type: 'image' }]);
        }
    }, []);

    const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
        onDrop: onPdfDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        multiple: true
    });

    const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
        onDrop: onImageDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        multiple: false
    });

    const removeFile = (fileToRemove) => {
        setPreviews(prev => prev.filter(p => p.file !== fileToRemove));
        if (fileToRemove === imageFile) {
            setImageFile(null);
        } else {
            setPdfFiles(prev => prev.filter(f => f !== fileToRemove));
        }
    };

    const handleUpload = async () => {
        if (pdfFiles.length === 0 || !imageFile) {
            setMessage('Por favor, selecciona al menos una factura y una imagen del menú.');
            setMessageType('error');
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

            setMessage('¡Archivos subidos exitosamente!');
            setMessageType('success');
            setPdfFiles([]);
            setImageFile(null);
            setPreviews([]);
        } catch (error) {
            console.error('Error subiendo archivos:', error);
            setMessage('Error subiendo archivos. Por favor, intenta nuevamente.');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Subir Facturas y Menú
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Dropzone para PDFs/Facturas */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Facturas (PDF o Imágenes)</h3>
                        <div
                            {...getPdfRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        >
                            <input {...getPdfInputProps()} />
                            <div className="flex flex-col items-center space-y-2">
                                <FileText className="h-12 w-12 text-gray-400" />
                                <p className="text-gray-600">
                                    Arrastra tus facturas aquí o haz clic para seleccionar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dropzone para Imagen del Menú */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Imagen del Menú</h3>
                        <div
                            {...getImageRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        >
                            <input {...getImageInputProps()} />
                            <div className="flex flex-col items-center space-y-2">
                                <ImageIcon className="h-12 w-12 text-gray-400" />
                                <p className="text-gray-600">
                                    Arrastra la imagen del menú aquí o haz clic para seleccionar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Área de Previsualización */}
                    {previews.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Archivos Seleccionados</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {previews.map(({ file, preview, type }, index) => (
                                    <div
                                        key={index}
                                        className="relative border rounded-lg p-2 group"
                                    >
                                        {type === 'image' ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                                <FileText className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                        <p className="mt-2 text-sm truncate">{file.name}</p>
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón de Subida */}
                    <Button
                        onClick={handleUpload}
                        disabled={uploading || pdfFiles.length === 0 || !imageFile}
                        className="w-full h-12"
                    >
                        {uploading ? (
                            <span className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Subiendo...</span>
                            </span>
                        ) : (
                            <span className="flex items-center space-x-2">
                                <Upload className="h-4 w-4" />
                                <span>Subir Archivos</span>
                            </span>
                        )}
                    </Button>

                    {/* Mensajes de Estado */}
                    {message && (
                        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UploadInvoices;