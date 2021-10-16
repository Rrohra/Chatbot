//this file is for saving the users in the chat app

//array for storing the users
const users_array = []


//we will implement - add user , remove user , check existing user , get User , get Usersroom

//1)Create user object  
const addUser = ({id, room , username})=>{
    //clean data
    username = username.trim().toLowerCase()
    room= room.trim().toLowerCase()

    //validate data
    if(!username || !room)   //user doesnt enter the username or room name
    {
        return {
            error: "Username and room is required !"
        }
    }


    //check for existing user
    const existingUser = users_array.find((user_variable)=>{                      //this return the actual user
        return user_variable.room === room && user_variable.username ===username
        
    })

    if (existingUser){
        return{
            error : "user already exists"
        }
    }
    
    //agar upar ka sab return statement dodge karke niche aata hai , iska matlab user is new , lets add him to users array
    const user = {id, username, room}    //creating a user object
    users_array.push(user)              //adding user to array
    return {user}    

}



//2)Remove User
const removeUser = (id)=>{
    const user_index = users_array.findIndex((user_variable)=>{                   //this returns the index postion no the actual user
        return user_variable.id == id
    })

    if (user_index!= -1){
        return users_array.splice(user_index , 1)[0]                                        //removes itme from array based on position
                                                                                        //1 is the number of items we want to remove
                                                                                        //returns an array
    }
}



//3) Get User, accept id and return the user object, hint : will use find method
const getUser = (id)=>{
    const searched_user = users_array.find((user_variable)=>{
        return user_variable.id === id
    })

    return searched_user
}

//4) gte user in room, accept room name and return users in room , hint : will use filter method

const getUsersInRoom_array = (room)=>{
    return users_array.filter((user_variable)=>{    // returns a nerw array based on condition
        return user_variable.room === room
    })
}

/*addUser({
    id: '12',
    room:'kopri',
    username:'rohit'
})

console.log(getUsersInRoom_array('kopri'))*/


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom_array

}