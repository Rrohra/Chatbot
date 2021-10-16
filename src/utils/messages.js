//generalised object 

const generate_message_toemitby_server = (username, text)=>{
    
    return {
        'username':username,
        'text' :  text,
    'createdAt' : new Date().getTime() 
} 
}

module.exports = {
    generate_message_toemitby_server
}