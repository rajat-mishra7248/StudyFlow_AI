class ResponseFormatter:

    @staticmethod
    def success(data):

        return {
            "status": "success",
            "data": data
        }

    @staticmethod
    def error(message):

        return {
            "status": "error",
            "message": message
        }