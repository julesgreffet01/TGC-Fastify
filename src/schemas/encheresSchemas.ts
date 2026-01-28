export const getAllEncheresSchemas = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        }
    }
}

export const findEnchereSchemas = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        },
        params: {
            type: 'object',
            required: ['idEnchere'],
            properties: {
                idEnchere: {type: 'string'},
            }
        }
    }
}