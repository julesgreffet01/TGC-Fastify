import {FastifyRequest} from "fastify";

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

export const createEnchereSchema = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        },
        body: {
            type: 'object',
            required: ['idCarte'],
            properties: {
                idCarte: {type: 'number'},
                earlyPrice: {type: 'number'},
            }
        }
    }
}

export const PlaceOnEnchereSchema = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        },
        body: {
            type: 'object',
            required: ['idCarte'],
            properties: {
                montant: {type: 'number'},
                idEnchere: {type: 'number'},
            }
        }
    }
}

export const CloseEnchereSchema = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        },
        body: {
            type: 'object',
            required: ['idCarte'],
            properties: {
                idEnchere: {type: 'number'},
            }
        }
    }
}