import React from 'react'

interface CardProps {
    id?: number
    name: string
    // Add other props and their types here if needed
}

const Card: React.FC<CardProps> = ({ name }) => {
    return (
        <div>{name}</div>
    )
}

export default Card
