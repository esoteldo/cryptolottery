import Swal from "sweetalert2"

export const registroOk = (email) => {
    
    Swal.fire({
      icon: 'success',
      title: 'Registro de Usuario Exitoso!',
      text: email,                        
    })
  }
export const usuarioEliminado = (email) => {
    
    Swal.fire({
      icon: 'success',
      title: 'Usuario Eliminado',
      text: email,                        
    })
  }
export const errorInitData = (error) => {
    
    Swal.fire({
        icon: 'error',
        title: 'error al obtener datos iniciales',
        text: error, 
        timer: 3000,
        theme: 'dark'                      
      })
  }
  export const noTelegramId = (error) => {
    
    Swal.fire({
        icon: 'error',
        title: 'No se pudo obtener el ID de Telegram',
        text: error, 
        timer: 3000 ,
        theme: 'dark'                     
      })
  }
  export const registroClienteNuevoOk = () => {
    
    Swal.fire({
      icon: 'success',
      title: 'Registro de Usuario Exitoso!',
      text: '', 
      timer: 3000                       
    })
  }
  export const registroClienteFallido = (error) => {
    if (Array.isArray(error.error)){
    Swal.fire({
      icon: 'error',
      title: 'Registro Fallido',
      html:`<ul>`+
        error.error.map((value)=>{
          return `<li>${value}</li>`
        })+`</ul>` ,
        timer: 4000                      
    })
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Registro Fallido',
        html:`Error De Registro `,
          timer: 4000                      
      })

    }
  }

  export const editarRegistroOk = () => {
    
    Swal.fire({
      icon: 'success',
      title: 'Registro actualizado Exitosamente!',
      text: '', 
      timer: 3000                       
    })
  }

  