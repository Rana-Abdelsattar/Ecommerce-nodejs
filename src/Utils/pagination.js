



export const paginationFuncion=({page=1,size=2})=>{

    if(page<1) page=1
    if(size<1) size=2

    const limit= +size    //+ before size means to convert string to integer because i will send it in query ,query is type string
    const skip =(+page -1) * limit   
    
    return {limit,skip}
}


