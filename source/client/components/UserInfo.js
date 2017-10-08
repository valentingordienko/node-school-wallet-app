import React from 'react';
import styled from 'emotion/react';

const User = styled.div`
	display: flex;
	align-items: center;
	font-size: 15px;
	color: #000;
`;

const AvatarContainer = styled.div`
    width: 42px;
	height: 42px;
	border-radius: 50%;
	margin-right: 10px;
	overflow: hidden;
`;

const Avatar = styled.img`
	width: 100%;
	margin-top: -3px;
`;

export default ({user}) => (

    <User>
        <AvatarContainer>
            <Avatar src={user.avatarUrl}/>
        </AvatarContainer>
        {user.name}
    </User>
);
