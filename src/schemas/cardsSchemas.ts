export const openBoosterSchema = {
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

export const convertSchema = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        },
        Body: {
            type: 'object',
            required: ['idCard'],
            properties: {
                idCard: {type: 'integer'},
            }
        }
    }
}