const guardarObjetoConId = (datos, id) => {
    return{
        ...datos,
        id
    }
}

module.exports = {guardarObjetoConId}