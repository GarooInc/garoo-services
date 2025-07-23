import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Image from 'react-bootstrap/Image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatDate = (excelDate) => {
    try {
        if (!excelDate) return 'N/A';

        // Si la fecha ya es un string, devolverla tal cual
        if (typeof excelDate === 'string') return excelDate;

        // Si es un número, asumir que es una fecha de Excel
        if (typeof excelDate === 'number') {
            // Fórmula para convertir fecha de Excel a fecha de JavaScript
            // (días desde 1900-01-01 a milisegundos desde 1970-01-01)
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return format(date, 'dd/MM/yyyy', { locale: es });
        }

        return 'Formato no soportado';
    } catch (error) {
        console.error('Error al formatear fecha:', error, 'Valor:', excelDate);
        return 'Error en fecha';
    }
};

const formatPeriod = (month, year) => {
    try {
        if (!month || !year) return 'N/A';
        return `${month}/${year}`;
    } catch (error) {
        console.error('Error al formatear período:', error);
        return 'N/A';
    }
};

const WorkerModal = ({ show, handleClose, workerData }) => {
    if (!workerData) return null;

    // Función segura para formatear fechas de experiencia
    const formatExperienceDate = (month, year) => {
        try {
            if (!month || !year) return 'N/A';
            // Si ya es un string con el formato esperado, devolverlo
            if (typeof month === 'string' && month.includes('/')) return month;
            return `${month}/${year}`;
        } catch (error) {
            console.error('Error al formatear fecha de experiencia:', error);
            return 'N/A';
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            animation={true}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            scrollable
        // className="modal-xl"
        >
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="fs-5">
                    {workerData['Nombre Completo'] || 'Detalles del Trabajador'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-0">
                <div className="row g-0">
                    {/* Columna izquierda */}
                    <div className="col-md-4 bg-light p-4">
                        <div className="text-center mb-4">
                            {workerData.Fotografia ? (
                                <Image
                                    src={workerData.Fotografia}
                                    roundedCircle
                                    className="img-thumbnail"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                    style={{ width: '150px', height: '150px' }}>
                                    <i className="bi bi-person-fill text-muted" style={{ fontSize: '4rem' }}></i>
                                </div>
                            )}

                            <h4 className="mt-3 mb-0">{workerData['Nombre Completo']}</h4>
                            <p className="text-muted">{workerData['Puesto Solicitud'] || workerData['Experiencia Puesto'] || 'Sin puesto especificado'}</p>

                            <div className="d-flex justify-content-center gap-2 mb-3">
                                {workerData.Linkedin && (
                                    <a href={workerData.Linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                        <i className="bi bi-linkedin me-1"></i> LinkedIn
                                    </a>
                                )}
                                {workerData.Behance && (
                                    <a href={workerData.Behance} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">
                                        <i className="bi bi-behance me-1"></i> Behance
                                    </a>
                                )}
                            </div>

                            <div className="bg-white p-3 rounded-3 shadow-sm">
                                <h6 className="text-center mb-3">Información de Contacto</h6>
                                <p className="mb-1">
                                    <i className="bi bi-telephone-fill text-primary me-2"></i>
                                    <a href={`tel:${workerData.Telefono}`}>{workerData.Telefono || 'N/A'}</a>
                                </p>
                                <p className="mb-1">
                                    <i className="bi bi-envelope-fill text-primary me-2"></i>
                                    <a href={`mailto:${workerData.Email}`}>{workerData.Email || 'N/A'}</a>
                                </p>
                                <p className="mb-0">
                                    <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                                    {workerData.Direccion || 'Dirección no especificada'}
                                </p>
                            </div>

                            <div className="mt-3 bg-white p-3 rounded-3 shadow-sm">
                                <h6 className="text-center mb-3">Información Adicional</h6>
                                <p className="mb-1">
                                    <strong>Disponibilidad:</strong> {workerData['Disponibilidad Laboral'] || 'No especificada'}
                                </p>
                                <p className="mb-1">
                                    <strong>Nacionalidad:</strong> {workerData.Nacionalidad || 'N/A'}
                                </p>
                                <p className="mb-1">
                                    <strong>Estado Civil:</strong> {workerData['Estado Civil'] || 'N/A'}
                                </p>
                                <p className="mb-1">
                                    <strong>Fecha Nacimiento:</strong> {formatDate(workerData['Fecha Nacimiento'])}
                                </p>
                                <p className="mb-0">
                                    <strong>Pretención Salarial:</strong> Q{workerData['Pretencion Salarial']?.toLocaleString() || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="col-md-8 p-4">
                        {/* Sección de Educación */}
                        <section className="mb-4">
                            <h5 className="border-bottom pb-2">
                                <i className="bi bi-mortarboard-fill text-primary me-2"></i>
                                Educación
                            </h5>
                            <div className="ps-3">
                                <h6 className="mb-1">{workerData['Educacion Titulo'] || 'Sin título especificado'}</h6>
                                <p className="mb-1 text-muted">
                                    {workerData['Educacion Institucion'] || 'Institución no especificada'}
                                </p>
                                <small className="text-muted">
                                    {formatPeriod(workerData['Educacion Periodo Inicio'])} - {formatPeriod(workerData['Educacion Periodo Fin'])}
                                </small>
                                <p className="mb-0">
                                    <strong>Nivel Educativo:</strong> {workerData['Educacion Nivel Educativo'] || 'N/A'}
                                </p>
                            </div>
                        </section>

                        {/* Sección de Experiencia Laboral */}
                        <section className="mb-4">
                            <h5 className="border-bottom pb-2">
                                <i className="bi bi-briefcase-fill text-primary me-2"></i>
                                Experiencia Laboral
                            </h5>
                            <div className="ps-3">
                                <h6 className="mb-1">{workerData['Experiencia Puesto'] || 'Puesto no especificado'}</h6>
                                <p className="mb-1 text-muted">
                                    {workerData['Experiencia Nombre Empresa'] || 'Empresa no especificada'}
                                </p>
                                <p className="mb-1">
                                    <strong>Período:</strong> {formatExperienceDate(workerData['Experiencia Fecha Ingreso Mes'], workerData['Experiencia Fecha Ingreso Ano'])} - {formatExperienceDate(workerData['Experiencia Fecha Egreso Mes'], workerData['Experiencia Fecha Egreso Ano'])}
                                </p>
                                <p className="mb-1">
                                    <strong>Salario Final:</strong> Q{workerData['Experiencia Salario Final']?.toLocaleString() || 'N/A'}
                                </p>
                                <p className="mb-1">
                                    <strong>Jefe Inmediato:</strong> {workerData['Experiencia Jefe Inmediato'] || 'N/A'}
                                </p>
                                <p className="mb-1">
                                    <strong>Motivo de Retiro:</strong> {workerData['Experiencia Motivo Retiro'] || 'N/A'}
                                </p>
                                <p className="mb-0">
                                    <strong>Desempeño:</strong> {workerData['Experiencia Desempeno'] || 'N/A'}
                                </p>
                            </div>
                        </section>

                        {/* Sección de Referencias */}
                        <section className="mb-4">
                            <h5 className="border-bottom pb-2">
                                <i className="bi bi-people-fill text-primary me-2"></i>
                                Referencias
                            </h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light mb-3">
                                        <div className="card-body p-3">
                                            <h6 className="card-title">Laborales</h6>
                                            <p className="mb-1">
                                                <strong>Nombre:</strong> {workerData['Referencias Laborales Nombre '] || 'N/A'}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Puesto:</strong> {workerData['Referencias Laborales Puesto '] || 'N/A'}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Teléfono:</strong> {workerData['Referencias Laborales Telefono '] || 'N/A'}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Email:</strong> {workerData['Referencias Laborales Email'] || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light mb-3">
                                        <div className="card-body p-3">
                                            <h6 className="card-title">Personales</h6>
                                            <p className="mb-1">
                                                <strong>Nombre:</strong> {workerData['Referencias Personales Nombre '] || 'N/A'}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Relación:</strong> {workerData['Referencias Personales Relacion '] || 'N/A'}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Teléfono:</strong> {workerData['Referencias Personales Telefono '] || 'N/A'}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Email:</strong> {workerData['Referencias Personales Email'] || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Sección de Documentos */}
                        <section>
                            <h5 className="border-bottom pb-2">
                                <i className="bi bi-folder-fill text-primary me-2"></i>
                                Documentos
                            </h5>
                            <div className="d-flex gap-2">
                                {workerData.Cv && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => window.open(workerData.Cv, '_blank')}
                                    >
                                        <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                                        Ver CV
                                    </Button>
                                )}
                                {workerData['File Of Work'] && (
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => window.open(workerData['File Of Work'], '_blank')}
                                    >
                                        <i className="bi bi-folder-fill me-1"></i>
                                        Portafolio
                                    </Button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={handleClose}>
                    <i className="bi bi-x-lg me-1"></i>
                    Cerrar
                </Button>
                <div className="ms-auto">
                    <small className="text-muted me-2">
                        Última actualización: {formatDate(workerData.Fecha) || 'N/A'}
                    </small>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default WorkerModal;