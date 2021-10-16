
const rohit = io()

//callback fucntion catches the argument 
///for comparison with callback.js in playground , this is add(4,5, (sum)=>{}) and the on in index js is const add=.... 
/*rohit.on('event_name',(count)=>{                                 //since the vent name is same , trigger hoga emit ke baad
   
    console.log("message from server recieved"+ count )
})*/


//for anabling and disabling buttons while request is being processed , we fist set the following variables
//Elements
const message_form = document.querySelector('#message-form')
const message_form_input_label = document.querySelector('input')             //all - inputs
const message_form_button = document.querySelector('button')            //all - buttons
const message_form_button2 = document.querySelector('#share_location')
const messages = document.querySelector('#messages')      //div elemetn for rendering the template
///const message_current_location = document.querySelector('#current_location')    //div elemetn for rendering curent locatyion(client) template


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML       // the template itself
const client_location_url_Template = document.querySelector('#client_location_url_template').innerHTML // the template itself
const leftsidebar_template = document.querySelector('#leftsidebar_template').innerHTML

//Options (for segrating rooms , ek room ka msg dusre room mein nahi jaana chaiye)
const {username, room} = Qs.parse(location.search , {ignoreQueryPrefix: true})   //ignore prefix will remove the question mark (location.search ka output is '?value="rohit"&fife="ritsdcs" ...aisa kuch)


////scrolling
const autoscroll = ()=>{
    
    //New incoming msg element
    const newMessage = messages.lastElementChild

    //height of the new message (element height  + margin height)
        //first lets get the margin height in  avariable
        const newMessage_all_css_applied = getComputedStyle(newMessage)
        const newMessage_margin = parseInt(newMessage_all_css_applied.marginBottom)
    const newMessage_height = newMessage.offsetHeight + newMessage_margin

    //Visible height of chat box messages at a time
    const visibleHeight = messages.offsetHeight

    //Complete height of chat box 
    const containerHeight = messages.scrollHeight

    //How far have i scrolled (basically niche se kitna upar hai hum , as scrollBottom is not availble islioye we have added visibleHeight to upar se present tak ka distance i.e is scrollTop)
    const scrollOffsetHeight = messages.scrollTop + visibleHeight


    //Logic of scroll karna hai ki nahi
    console.log(containerHeight, newMessage_height, scrollOffsetHeight)
    if(Math.round(containerHeight - newMessage_height -1) <= Math.round(scrollOffsetHeight))
    {
        //haan autoscroll karan hai 
        console.log("aisdbijsdb")
        messages.scrollTop = messages.scrollHeight
    }
}


//situation-2 client side listening to recieve message from server
rohit.on('welcome_msg', (msg)=>{
    console.log("Server says : -" + msg)

    //render the template
    //const html = Mustache.render(messageTemplate)             //Mustaceh lib that we added vua script in index.html
    //to inject something via {{}} in html
    const html = Mustache.render(messageTemplate, {
        'message' : msg.text  ,                                      //server se client mein aaraha response yahan inject karo , jo index.html mein dikhega
        'username' : msg.username,
        'created_At_time' : moment(msg.createdAt).format('HH : MM')
    })
    messages.insertAdjacentHTML('beforeend',html)               // yeh line text ko dikhaega index.html mein
                                                                    //{{message }}   likha hua hai in 'message' :
    //scrolling
    autoscroll()
})


rohit.on('current_location_msg', (urll)=>{
    console.log("Server says : " + urll)
    //render the current location (client location)template
    const html2 = Mustache.render(client_location_url_Template, {
        'url':urll.text,
        'username':urll.username,
        'created_At_time2': moment(urll.createdAt).format('HH : MM')
    })
    messages.insertAdjacentHTML('beforeend',html2)

    //scrolling
    autoscroll()

})

//listener for roomData , to get all the data given by server when user 'joins' or 'disconnects' and display data in left side bar
rohit.on('roomData',({room, users_in_room})=>{
    console.log(room)
    console.log(users_in_room)
     //render the users and room on left side pane
     const html3 = Mustache.render(leftsidebar_template ,{
        'room': room,
        'users_in_room': users_in_room

    })
    //messages.insertAdjacentHTML('beforeend',html3)              idddhar messages wont be selected for inserting HTML (allt aken from chat.html), instead
    document.querySelector('#sidebar').innerHTML =  html3
})


document.querySelector('#messsage-form').addEventListener('submit', (e)=>{
    e.preventDefault()

    //herre we will diabale formbutton
    message_form_button.setAttribute('disabled', 'diable the button')
    //const message =document.querySelector('input').value      //will break if more inputs are added
    const message = e.target.cname.value

    // se we have implemented event acknowkedgement
    rohit.emit('send_location', message,(acknowkedgement)=>{//this will send data to server
                                                        //make sure to keep the event name -"increase_count" same on server too
        if(acknowkedgement){
            return console.log(acknowkedgement)        //server error(if bad words are provided) return karega in ack

        }

        else{
            console.log("Delivered")                   // nahi hai kuch bi acknowkedgement mein matlab deliver hua
        }
    }) 
    
    //herre we will reenable  form button
    message_form_button.removeAttribute('disabled')
    message_form_input_label.value= ''                 //clearing the label\
    message_form_input_label.focus()
})


//share clients current location with server 
//it will be shared when the button index.html is clicked
message_form_button2.addEventListener('click', ()=>{
    if(!navigator.geolocation){                           //for browesers that dont support geolocation
        return alert("Geolocation not supported")
    }

    else{
        message_form_button2.setAttribute('disabled', 'diable the button')

        navigator.geolocation.getCurrentPosition((position)=>{
            console.log(position)
            rohit.emit('send_client_location', {
                "latitude" :position.coords.latitude,
                "longitude" : position.coords.latitude
            }, (acknowkedgement2)=>{
                if(acknowkedgement2){
                    return console.log(acknowkedgement2)
                }
                else{
                    console.log("Location shared successfully")
                }
            })
        })
    }
    message_form_button2.removeAttribute('disabled', 'diable the button')
})



rohit.emit('join',{username, room }, (error)=>{                   //error wala part is ack
    if(error){
        alert(error)
        location.href = '/'                 //takes us back to login page
    }
})
//bradn new event that server is gonna listen for 
//so now its servers job to do when this event ocuurs