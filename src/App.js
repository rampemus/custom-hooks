import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useField = (type) => {

    const [value, setValue] = useState('')

    const onChange = (event) => {
        setValue(event.target.value)
    }

    const reset = () => {
        setValue('')
    }

    return {
        type,
        value,
        onChange,
        reset
    }
}

const useResource = (baseUrl) => {

    const [resources, setResources] = useState([])

    const initAll = () => {
        axios.get(baseUrl)
            .then(response => {
                setResources(response.data)
                console.log(response.data)
            })
    }

    const create = (resource) => {

        const config = {
            headers: { Authorization: 'token' }
        }

        const oldState = resources
        const tempResource = {...resource, id:resources.length + 1}

        setResources(oldState.concat(tempResource))
        axios.post(baseUrl, resource, config)
            .then(response => {
                console.log('got response:', response.data)
                console.log('should be same as', tempResource)
            }).catch(error => {
                console.log('error: ', error.message)
                setResources(oldState)
            })
    }

    const service = {
        create,
        initAll
    }

    return [
        resources, service
    ]
}

const App = () => {
    const content = useField('text')
    const name = useField('text')
    const number = useField('text')

    const [noData, setNoData] = useState(true)
    const [notes, noteService] = useResource('http://localhost:3005/notes')
    const [persons, personService] = useResource('http://localhost:3005/persons')

    useEffect(() => {
        if ( noData ) {
            setNoData(false)
            noteService.initAll()
            personService.initAll()
        }
    },[noData, noteService, personService])
    //above because if you write simply:
    //useEffect(() => {
    //    noteService.initAll()
    //    personService.initAll()
    //},[])
    //it'll give you either infinite loop or warning

    const handleNoteSubmit = (event) => {
        event.preventDefault()
        noteService.create({ content: content.value })
        content.reset()
    }

    const handlePersonSubmit = (event) => {
        event.preventDefault()
        personService.create({ name: name.value, number: number.value})
        name.reset()
        number.reset()
    }

    return (
        <div>
            <h2>notes</h2>
            <form onSubmit={handleNoteSubmit}>
                <input {...content} reset='null'/>
                <button>create</button>
            </form>
            {notes.map(n => <p key={n.id}>{n.content}</p>)}

            <h2>persons</h2>
            <form onSubmit={handlePersonSubmit}>
                name <input {...name} reset='null'/> <br/>
                number <input {...number} reset='null'/>
                <button>create</button>
            </form>
            {persons.map(n => <p key={n.id}>{n.name} {n.number}</p>)}
        </div>
    )
}

export default App
