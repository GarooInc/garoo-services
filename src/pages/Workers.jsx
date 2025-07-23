import styles from './workers.module.css';

import { useState, useEffect } from 'react';
import { Card, Tabs, Tab, Table, Button, Badge, Spinner, Alert, Image, InputGroup, Form } from 'react-bootstrap';
import { useWorker } from '../config/WorkerProvider';
import WorkerModal from '../components/WorkerModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import garooLogo from '../assets/img/garoo-logo.png';

const Workers = () => {

    const { triggerN8N, data: dataFromState, loading, error } = useWorker();

    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);

    useEffect(() => {
        if (dataFromState) {
            setData(dataFromState);
        }
    }, [dataFromState]);

    const handleClick = async () => {
        try {
            await triggerN8N();
        }
        catch (err) {
            console.error('Error en el componente:', err);
        }
    };

    const handleViewDetails = (worker) => {
        setSelectedWorker(worker);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedWorker(null);
    };

    const generateWorkerPDF = (worker) => {
        try {
            console.log('Datos completos del trabajador:', worker); // Mostrará toda la estructura del objeto
            console.log('Campos disponibles:', Object.keys(worker || {})); // Mostrará todas las claves disponibles

            const doc = new jsPDF();
            let yPos = 20; // Posición vertical inicial

            // Título del documento
            doc.setFontSize(20);
            doc.setTextColor(33, 37, 41);
            doc.text('Información del Trabajador', 14, yPos);
            yPos += 15;

            // Fecha de generación
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, yPos);
            yPos += 15;

            const addSection = (title, data) => {
                try {
                    if (yPos > 250) {
                        doc.addPage();
                        yPos = 20;
                    }

                    const filteredData = data.filter(([key, value]) => {
                        // No filtrar los campos CV y Portafolio aunque estén vacíos
                        if (key === 'CV' || key === 'Portafolio') return true;
                        return value !== null && value !== undefined && value !== '';
                    });

                    if (filteredData.length === 0) return;

                    doc.setFontSize(12);
                    doc.setTextColor(100);
                    doc.text(title, 14, yPos);
                    yPos += 8;

                    // Primero dibujamos la tabla sin los enlaces
                    const tableData = filteredData.map(([key, value]) => {
                        // Para CV y Portafolio, mostramos "No disponible" si no hay valor
                        if ((key === 'CV' || key === 'Portafolio') && (!value || value === 'No disponible')) {
                            return [key, 'No disponible'];
                        }
                        return [key, value || 'N/A'];
                    });

                    const tableConfig = {
                        startY: yPos,
                        head: [['Campo', 'Valor']],
                        body: tableData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [52, 58, 64],
                            textColor: 255,
                            fontStyle: 'bold',
                            fontSize: 10
                        },
                        styles: {
                            fontSize: 9,
                            cellPadding: 3,
                            overflow: 'linebreak',
                            cellWidth: 'wrap',
                            minCellHeight: 10
                        },
                        columnStyles: {
                            0: { cellWidth: 70, fontStyle: 'bold' },
                            1: { cellWidth: 'auto' }
                        },
                        didDrawCell: (data) => {
                            // Solo procesamos celdas de la columna de valor (índice 1)
                            if (data.column.index === 1) {
                                const key = data.row.raw[0];
                                const value = data.row.raw[1];

                                // Solo procesamos CV y Portafolio que tengan valor
                                if ((key === 'CV' || key === 'Portafolio') && value && value !== 'No disponible') {
                                    // Posición donde debe ir el texto del enlace
                                    const textX = data.cell.x + data.cell.padding('left');
                                    const textY = data.cell.y + data.cell.padding('top') + 7; // Ajuste vertical

                                    // Guardamos el estado actual
                                    const originalTextColor = doc.getTextColor();

                                    // Dibujamos el enlace
                                    doc.setTextColor(0, 0, 255); // Azul
                                    doc.setFont(undefined, 'underline');
                                    doc.textWithLink(value, textX, textY, { url: value });

                                    // Restauramos el estado
                                    doc.setTextColor(originalTextColor);
                                    doc.setFont(undefined, 'normal');
                                }
                            }
                        }
                    };

                    // Dibujamos la tabla
                    autoTable(doc, tableConfig);

                    // Actualizamos la posición Y
                    yPos = doc.lastAutoTable.finalY + 10;

                } catch (error) {
                    console.error(`Error en la sección ${title}:`, error);
                }
            };

            console.log('Datos del trabajador:', {
                'Cv': worker['Cv'],  // Cambiado de 'CV' a 'Cv'
                'cvUrl': worker['cvUrl'],
                'File Of Work': worker['File Of Work'],  // Agregado
                'portfolioUrl': worker['portfolioUrl']
            });

            // Datos Personales
            addSection('Datos Personales', [
                ['Nombre Completo', worker['Nombre Completo']],
                ['Puesto', worker['Puesto Solicitud'] || worker['Experiencia Puesto']],
                ['Nacionalidad', worker.Nacionalidad],
                ['Estado Civil', worker['Estado Civil']],
                ['Fecha Nacimiento', formatDate(worker['Fecha Nacimiento'])],
                ['Teléfono', worker.Telefono],
                ['Email', worker.Email],
                ['Dirección', worker.Direccion],
                ['Disponibilidad', worker['Disponibilidad Laboral']],
                ['Pretención Salarial', worker['Pretencion Salarial'] ? `Q${worker['Pretencion Salarial'].toLocaleString()}` : 'N/A'],
                ['LinkedIn', worker.Linkedin],
                ['Behance', worker.Behance],
                // Reemplaza la sección de CV y Portafolio con:
                ['CV', (() => {
                    const cv = worker['Cv'] || worker['CV'] || worker['cvUrl']; // Agregamos 'Cv' con 'c' mayúscula
                    return cv && typeof cv === 'string' && (cv.startsWith('http') || cv.startsWith('www.')) ?
                        cv : 'No disponible';
                })()],
                ['Portafolio', (() => {
                    const portfolio = worker['File Of Work'] || worker['Portafolio'] || worker['portfolioUrl']; // Agregamos 'File Of Work'
                    return portfolio && typeof portfolio === 'string' && (portfolio.startsWith('http') || portfolio.startsWith('www.')) ?
                        portfolio : 'No disponible';
                })()],
            ]);

            // Educación
            addSection('Educación', [
                ['Título', worker['Educacion Titulo']],
                ['Institución', worker['Educacion Institucion']],
                ['Nivel Educativo', worker['Educacion Nivel Educativo']],
                ['Período', `${formatPeriod(worker['Educacion Periodo Inicio'])} - ${formatPeriod(worker['Educacion Periodo Fin'])}`]
            ]);

            // Experiencia Laboral
            addSection('Experiencia Laboral', [
                ['Empresa', worker['Experiencia Nombre Empresa']],
                ['Puesto', worker['Experiencia Puesto']],
                ['Período', `${formatExperienceDate(worker['Experiencia Fecha Ingreso Mes'], worker['Experiencia Fecha Ingreso Ano'])} - ${formatExperienceDate(worker['Experiencia Fecha Egreso Mes'], worker['Experiencia Fecha Egreso Ano'])}`],
                ['Salario Final', worker['Experiencia Salario Final'] ? `Q${worker['Experiencia Salario Final'].toLocaleString()}` : 'N/A'],
                ['Jefe Inmediato', worker['Experiencia Jefe Inmediato']],
                ['Motivo de Retiro', worker['Experiencia Motivo Retiro']],
                ['Desempeño', worker['Experiencia Desempeno']]
            ]);

            // Referencias (si existen)
            if (worker['Referencia Nombre']) {
                addSection('Referencias', [
                    ['Nombre', worker['Referencia Nombre']],
                    ['Puesto', worker['Referencia Puesto']],
                    ['Empresa', worker['Referencia Empresa']],
                    ['Teléfono', worker['Referencia Telefono']],
                    ['Email', worker['Referencia Email']]
                ]);
            }

            // Habilidades (si existen)
            if (worker['Habilidades']) {
                addSection('Habilidades', [
                    ['Habilidades', worker['Habilidades']]
                ]);
            }

            // Guardar el PDF
            doc.save(`CV_${(worker['Nombre Completo'] || 'trabajador').replace(/[^a-z0-9]/gi, '_')}.pdf`);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    // Función auxiliar para formatear fechas
    const formatPeriod = (period) => {
        try {
            if (!period) return 'N/A';

            // Si el periodo ya está en el formato deseado
            if (typeof period === 'string' && period.match(/\d{1,2}\/\d{4}/)) {
                return period;
            }

            // Si es un objeto de fecha
            if (period instanceof Date) {
                return `${period.getMonth() + 1}/${period.getFullYear()}`;
            }

            // Si es un número (fecha de Excel)
            if (typeof period === 'number') {
                const date = new Date((period - 25569) * 86400 * 1000);
                return isNaN(date.getTime()) ? 'N/A' : `${date.getMonth() + 1}/${date.getFullYear()}`;
            }

            return String(period);
        } catch (error) {
            console.error('Error al formatear período:', period, error);
            return 'N/A';
        }
    };

    const formatExperienceDate = (month, year) => {
        try {
            if (!month || !year) return 'N/A';
            return `${month}/${year}`;
        } catch (error) {
            console.error('Error al formatear fecha de experiencia:', { month, year }, error);
            return 'N/A';
        }
    };

    const formatDate = (date) => {
        try {
            if (!date) return 'N/A';

            // Si ya es un string, devolverlo tal cual
            if (typeof date === 'string') {
                // Intentar parsear si tiene formato de fecha
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate.toLocaleDateString('es-GT');
                }
                return date;
            }

            // Si es un número (fecha de Excel)
            if (typeof date === 'number') {
                const jsDate = new Date((date - 25569) * 86400 * 1000);
                return isNaN(jsDate.getTime()) ? 'N/A' : jsDate.toLocaleDateString('es-GT');
            }

            // Si es un objeto Date
            if (date instanceof Date) {
                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-GT');
            }

            return 'N/A';
        } catch (error) {
            console.error('Error al formatear fecha:', date, error);
            return 'N/A';
        }
    };

    const filteredWorkers = data.filter(worker => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (worker['Nombre Completo']?.toLowerCase().includes(searchLower)) ||
            (worker['Puesto Solicitud']?.toLowerCase().includes(searchLower)) ||
            (worker['Experiencia Puesto']?.toLowerCase().includes(searchLower)) ||
            (worker.Nacionalidad?.toLowerCase().includes(searchLower)) ||
            (worker['Disponibilidad Laboral']?.toLowerCase().includes(searchLower)) ||
            (worker['Educacion Titulo']?.toLowerCase().includes(searchLower)) ||
            (worker['Educacion Institucion']?.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="mt-4">
            <Card>
                <Card.Body className=''>
                    <Card.Title className='mb-5 d-flex justify-content-between mx-1'>
                        <span className='fs-1 fw-bold'>Reclutamiento</span>
                        <Image src={garooLogo} roundedCircle fluid width={100} height={100} className='border border-primary border-2' />
                    </Card.Title>

                    <div className='mx-4'>
                        <Button
                            variant="primary"
                            onClick={handleClick}
                            disabled={loading}
                            className="mb-3"
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Procesando...
                                </>
                            ) : 'Actualizar Datos'}
                        </Button>

                        {error && (
                            <Alert variant="danger" className="mt-3">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error.message}</p>
                            </Alert>
                        )}

                        <Tabs
                            defaultActiveKey="workers"
                            transition={false}
                            id="workers-tabs"
                            className="mb-3"
                        >
                            <Tab eventKey="workers" title="Tabla">
                                <div className="mt-5 mb-3 w-25">
                                    <InputGroup className='border border-dark rounded'>
                                        <InputGroup.Text id="search-workers">
                                            <i className="bi bi-search"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Buscar trabajadores..."
                                            aria-label="Buscar trabajadores"
                                            aria-describedby="search-workers"
                                            className='bg-light'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <Button
                                                variant="outline-dark"
                                                onClick={() => setSearchTerm('')}
                                                aria-label="Limpiar búsqueda"
                                            >
                                                <i className="bi bi-lg bi-x"></i>
                                            </Button>
                                        )}
                                    </InputGroup>

                                    <small className="text-muted">
                                        {filteredWorkers.length} registro{filteredWorkers.length !== 1 ? 's' : ''} encontrado{filteredWorkers.length !== 1 ? 's' : ''}
                                    </small>
                                </div>

                                <div className="table-responsive">
                                    <Table hover className={`${styles['table']} ${styles['fs-10']}`}>
                                        <thead className='table-secondary'>
                                            <tr>
                                                <th>#</th>
                                                <th>Nombre Completo</th>
                                                <th>Puesto</th>
                                                <th>Nacionalidad</th>
                                                <th>Disponibilidad</th>
                                                <th>Pretención Salarial</th>
                                                <th>Educación</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {Array.isArray(filteredWorkers) && filteredWorkers.map((worker, index) => (
                                                <tr key={worker.id || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{worker['Nombre Completo'] || 'N/A'}</td>
                                                    <td>{worker['Puesto Solicitud'] || worker['Experiencia Puesto'] || 'N/A'}</td>
                                                    <td>{worker.Nacionalidad || 'N/A'}</td>
                                                    <td>
                                                        {worker['Disponibilidad Laboral'] || 'No especificada'}
                                                    </td>
                                                    <td>Q{worker['Pretencion Salarial']?.toLocaleString() || 'N/A'}</td>
                                                    <td>
                                                        {worker['Educacion Titulo'] || 'N/A'}
                                                        {worker['Educacion Institucion'] && ` (${worker['Educacion Institucion']})`}
                                                    </td>

                                                    <td>
                                                        <div className='d-flex gap-1'>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                className="me-1"
                                                                title="Ver detalles"
                                                                onClick={() => handleViewDetails(worker)}
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </Button>

                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                title="Descargar PDF"
                                                                onClick={() => generateWorkerPDF(worker)}
                                                            >
                                                                <i className="bi bi-file-earmark-pdf"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab>
                            <Tab eventKey="response" title="Respuesta del servidor">
                                <div className="mt-4">
                                    <h4>Respuesta del servidor:</h4>
                                    <pre className="bg-light p-3 rounded">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal de detalles del trabajador */}
            {selectedWorker && (
                <WorkerModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    workerData={selectedWorker}
                />
            )}
        </div>
    );
};

export default Workers;