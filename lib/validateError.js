/**
 * In case of an error, log it before rethrowing
 */
module.exports = validateError;

function validateError(err, fileName) {
    if (err) {
      var errMessage = 'failed to download ' + fileName;
      console.error(errMessage, err);
      throw new Error(errMessage);
    }
}
