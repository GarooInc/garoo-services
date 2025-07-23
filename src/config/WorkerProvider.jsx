import { createContext, useContext, useEffect, useState } from "react";

const WorkerContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWorker = () => {
    const context = useContext(WorkerContext);
    if (!context) {
        throw new Error("useWorker debe usarse dentro de un WorkerProvider");
    }
    return context;
};


export const WorkerProvider = ({ children }) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const N8N_WEBHOOK_URL = 'https://n8n.srv853599.hstgr.cloud/webhook/6dde1fd9-4b59-4639-b0ba-3474f164617d';

    const API_KEY = 'MI_SECRETO_API_KEY';

    const triggerN8N = async () => {

        setLoading(true);
        setError(null);

        try {
            const payload = {
                message: 'Solicito datos',
                user: 'Garoo Inc',
                timestamp: new Date().toISOString()
            };

            console.log('Enviando petición a:', N8N_WEBHOOK_URL);

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                mode: 'cors', // Importante para peticiones CORS
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            setData(responseData);
            console.log('Respuesta del servidor:', responseData);

            // Borrar en localStorage
            if (localStorage.getItem('data-n8n')) {
                localStorage.removeItem('data-n8n'); // Borrar los datos existentes
            }
            // Guardar en localStorage
            localStorage.setItem('data-n8n', JSON.stringify(responseData));

            return responseData;

        } catch (error) {
            console.error('Error en la petición:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            setError({
                message: error.message || 'Error al conectar con el servidor',
                code: error.code || 'UNKNOWN_ERROR'
            });
            throw error; // Re-lanzar para manejo adicional si es necesario
        }
        finally {
            setLoading(false);
        }
    };


    useEffect(() => {

        const storedData = localStorage.getItem('data-n8n');

        if (storedData) {
            setData(JSON.parse(storedData));
        }

    }, []);


    return (
        <WorkerContext.Provider
            value={{
                loading,
                data,
                error,
                setData,
                triggerN8N
            }}
        >
            {children}
        </WorkerContext.Provider>
    );
};
