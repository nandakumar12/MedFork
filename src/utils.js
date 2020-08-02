const uuidv4 = require( 'uuid/v4');

const getNodeIdentifier = () => uuidv4().replace(/-/g, '');

module.exports=getNodeIdentifier;
