const axios = require('axios');

async function getUser(accessToken) {
	const requestOptions = {
		url: 'https://api.pipedrive.com/v1/users/me',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		timeout: 10000
	};

	const userInfo = await axios(requestOptions);

	return userInfo.data;
}

async function getDeals(accessToken) {
	const requestOptions = {
		url: 'https://api.pipedrive.com/v1/deals?status=open',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		timeout: 10000
	};
	const deals = await axios(requestOptions);

	return deals.data;
}

async function getDealById(accessToken, dealId) {
    const requestOptions = {
        url: "https://api.pipedrive.com/v1/deals/"+dealId,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const deals = await axios(requestOptions);

    return deals.data;
}

async function getUsers(accessToken) {
    const requestOptions = {
        url: "https://api.pipedrive.com/v1/users?limit=10",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const users = await axios(requestOptions);

    return users.data;
}

async function updateDeal(id, outcome, accessToken) {
	// outcome : {}
	const requestOptions = {
		url: `https://api.pipedrive.com/v1/deals/${id}`,
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		data: outcome,
		timeout: 10000
	};

	await axios(requestOptions);
}

async function updatePerson(id, outcome, accessToken) {
    const requestOptions = {
        url: `https://api.pipedrive.com/v1/persons/${id}`,
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: outcome,
        timeout: 10000,
    };

    await axios(requestOptions);
}

async function getFieldOptions(accessToken, fieldId) {
	const requestOptions = {
		url: `https://api.pipedrive.com/v1/dealFields/${fieldId}`,
		method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const field = await axios(requestOptions);

    return field;
}

async function getDealFields(accessToken) {
	const requestOptions = {
        url: "https://api.pipedrive.com/v1/dealFields?start=0&limit=500",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const fields = await axios(requestOptions);

    return fields.data;
}

async function getDealField(token, fieldApi) {
	let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://api.pipedrive.com/v1/dealFields/" + fieldApi,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            Cookie: "__cf_bm=0BkuZ1e1fWUU8gpDJaqNt3NsN9LaUhwYRwxBXnOyIgI-1717593710-1.0.1.1-njv7uvxJ0K_N2WGeJpa2kf1UlPns__Ra_LQ4ZVfF2_NIoHQ0W7Q0xhxq3hEqGT.1g5wRPTvjOgbKUHn8Fqxi7w",
        },
    };
	const field = await axios(config);
	return field;
}

module.exports = {
    getUser,
    getDeals,
    getDealById,
    updateDeal,
    getFieldOptions,
    getDealFields,
    getDealField,
	updatePerson,
	getUsers
};