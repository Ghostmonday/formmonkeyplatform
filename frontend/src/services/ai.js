import { validateAIPrediction, validateUserCorrection } from '../utils/validation';
/**
 * Fetch AI predictions for a document
 * @param jobId The job ID to fetch predictions for
 * @returns Array of AI predicted fields
 */
export async function getAIPredictions(jobId) {
    try {
        // Simulated API call - would be replaced with actual API implementation
        const response = await fetch(`/api/documents/${jobId}/predictions`);
        const data = await response.json();
        // Validate each prediction
        const validatedPredictions = data.predictions.map((prediction) => validateAIPrediction(prediction));
        return validatedPredictions;
    }
    catch (error) {
        console.error('Error fetching AI predictions:', error);
        return [];
    }
}
/**
 * Submit a user correction
 * @param jobId The job ID to submit the correction for
 * @param correction The correction to submit
 * @returns The submitted correction or null if there was an error
 */
export async function submitCorrection(jobId, correction) {
    try {
        // Validate the correction before sending
        const validatedCorrection = validateUserCorrection(correction);
        // Simulated API call - would be replaced with actual API implementation
        const response = await fetch(`/api/documents/${jobId}/corrections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validatedCorrection)
        });
        const data = await response.json();
        return validateUserCorrection(data);
    }
    catch (error) {
        console.error('Error submitting correction:', error);
        return null;
    }
}
/**
 * Get user corrections for a document
 * @param jobId The job ID to fetch corrections for
 * @returns Array of user corrections
 */
export async function getUserCorrections(jobId) {
    try {
        // Simulated API call - would be replaced with actual API implementation
        const response = await fetch(`/api/documents/${jobId}/corrections`);
        const data = await response.json();
        // Validate each correction
        const validatedCorrections = data.corrections.map((correction) => validateUserCorrection(correction));
        return validatedCorrections;
    }
    catch (error) {
        console.error('Error fetching user corrections:', error);
        return [];
    }
}
