const express = require('express');
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const api = require('./api');
const config = require('./config');
const User = require('./db/user');

const searchHelper = require('./helpers/arraySearch');

User.createTable();

const app = express();
const port = 3000;

passport.use(
	'pipedrive',
	new OAuth2Strategy({
			authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
			tokenURL: 'https://oauth.pipedrive.com/oauth/token',
			clientID: config.clientID || '',
			clientSecret: config.clientSecret || '',
			callbackURL: config.callbackURL || ''
		}, async (accessToken, refreshToken, profile, done) => {
			const userInfo = await api.getUser(accessToken);
			const user = await User.add(
				userInfo.data.name,
				accessToken,
				refreshToken
			);

			done(null, { user });
		}
	)
);

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
	req.user = await User.getById(1);
	next();
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/auth/pipedrive', passport.authenticate('pipedrive'));
app.get('/auth/pipedrive/callback', passport.authenticate('pipedrive', {
	session: false,
	failureRedirect: '/',
	successRedirect: '/'
}));
app.get('/', async (req, res) => {
	if (req.user.length < 1) {
		return res.redirect("/auth/pipedrive");
	}

	try {
		const deals = await api.getDeals(req.user[0].access_token);

		res.render('deals', {
			name: req.user[0].username,
			deals: deals.data
		});
	} catch (error) {
		console.log(error);

		return res.send('Failed to get deals');
	}
});
app.get('/deals/:id', async (req, res) => {
	const randomBoolean = Math.random() >= 0.5;
	const outcome = randomBoolean === true ? 'won' : 'lost';

	try {
		await api.updateDeal(req.params.id, outcome, req.user[0].access_token);

		res.render('outcome', { outcome });
	} catch (error) {
		console.log(error);

		return res.send('Failed to update the deal');
	}
});
app.get('/job', async (req, res) => {
	if (req.user.length < 1) {
        return res.redirect("/auth/pipedrive");
    }
	try {
		res.render('newJob');
	} catch (error) {
		console.log(error);

        return res.send("Failed to create job");
	}
});

app.get("/job/:id", async (req, res) => {
    try {
        const deal = await api.getDealById(
            req.user[0].access_token,
            req.params.id
        );

        const dealCopy = { ...deal };

        let names = deal.data.person_id.name.split(" ");
        let primaryPhone = searchHelper.search(
            deal.data.person_id.phone,
            "primary",
            true
        ).value;
        let primaryEmail = searchHelper.search(
            deal.data.person_id.email,
            "primary",
            true
        ).value;

        deal.data.person_id.firstName = names[0];
        deal.data.person_id.lastName = names[1];

        deal.data.person_id.primaryPhone = primaryPhone;
        deal.data.person_id.primaryEmail = primaryEmail;

        // res.send(JSON.stringify(dealCopy.data));

        // address api key : 299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d
        // job type api key : 6b19ddd5da6739b4eb6d5b8497382c6c22d0562f
        // job source api key : 6cef672fd24d6ac50ace1c5575c3096e62ab7caf
        // job date api key : 20b5e382db09016c3d3c50237fdd5ea571eee612
        // job start time api key : 627125e89aeefb7e561294ea95bea7d20bea3623
        // job end time api key : d8abae435723692328ce001324623c736c46fb0d
        // area technician api key : b00f25ae245660d0b8bd63f707d18ca2b2b243e9;
        // technician api key : d5e179ac9a9b6112d886e2deea346c024115b09a;
        // job description api key : bc23ce6cc146eb3cb2df110c686b66a1fcadcc4f;

        const fields = await api.getDealFields(req.user[0].access_token);

        deal.data.jobTypeValue =
            deal.data["6b19ddd5da6739b4eb6d5b8497382c6c22d0562f"];

        let jobTypeField = searchHelper.search(
            fields.data,
            "key",
            "6b19ddd5da6739b4eb6d5b8497382c6c22d0562f"
        );
        deal.data.jobTypeOptions = jobTypeField.options;

        deal.data.jobTypeLabel = searchHelper.search(
            deal.data.jobTypeOptions,
            "id",
            deal.data.jobTypeValue
        ).label;

        deal.data.jobSourceValue =
            deal.data["6cef672fd24d6ac50ace1c5575c3096e62ab7caf"];
        let jobSourceField = searchHelper.search(
            fields.data,
            "key",
            "6cef672fd24d6ac50ace1c5575c3096e62ab7caf"
        );
        deal.data.jobSourceOptions = jobSourceField.options;
        deal.data.jobSourceLabel = searchHelper.search(
            deal.data.jobSourceOptions,
            "id",
            deal.data.jobSourceValue
        ).label;
        deal.data.jobDescription =
			deal.data["bc23ce6cc146eb3cb2df110c686b66a1fcadcc4f"];

        deal.data.technician =
            deal.data["b00f25ae245660d0b8bd63f707d18ca2b2b243e9"];
        deal.data.address = deal.data[
            "299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d"
        ].replaceAll(" ", "_");

        let street = `${deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_street_number"]} ${deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_route"]}`;
        deal.data.street = street.replaceAll(" ", "_");
        // deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_route"];
        deal.data.zip =
            deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_postal_code"];
        deal.data.city =
            deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_locality"];
        deal.data.state =
            deal.data["299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_country"];
        // deal.data.area =
        //     deal.data[
        //         "299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d_admin_area_level_1"
        //     ];

        deal.data.startDate =
            deal.data["20b5e382db09016c3d3c50237fdd5ea571eee612"];
        deal.data.startTime =
            deal.data["627125e89aeefb7e561294ea95bea7d20bea3623"];
        deal.data.endTime =
			deal.data["d8abae435723692328ce001324623c736c46fb0d"];


		const users = await api.getUsers(
            req.user[0].access_token
		);
		let userOptions = [];
		for (let i = 0; i < users.data.length; i++) {
			userOptions.push({ id: users.data[i].id, name: users.data[i].name });
		}
		deal.data.technicianOptions = userOptions;
		deal.data.technicianId =
            deal.data["d5e179ac9a9b6112d886e2deea346c024115b09a"].id;
		deal.data.technicianName =
            deal.data["d5e179ac9a9b6112d886e2deea346c024115b09a"].name;

        res.render("newJob", {
            deal: deal.data,
        });
    } catch (error) {
        console.log(error);

        return res.send("Failed to create job");
    }
});

app.post("/newJob/:id", async (req, res) => {
	try {
		const deal = await api.getDealById(
			req.user[0].access_token,
			req.params.id
		);

		let reqBody = req.body;
		await api.updatePerson(
            deal.data.person_id.value,
            {
                name: `${reqBody.fName} ${reqBody.lName}`,
                email: [
                    {
                        value: reqBody.email,
                        primary: true,
                    },
                ],
                phone: [
                    {
                        value: `${reqBody.phone}`,
                        primary: true,
                    },
                ],
            },
            req.user[0].access_token
		);
		console.log("updated person");
		await api.updateDeal(
            req.params.id,
            {
                "299e5885487b8b0ccf8dce38c4bbd9cd2c0f074d": reqBody.address,
                "20b5e382db09016c3d3c50237fdd5ea571eee612": `${reqBody.startDate}`,
                "627125e89aeefb7e561294ea95bea7d20bea3623": `${reqBody.startTime}`,
				"d8abae435723692328ce001324623c736c46fb0d": `${reqBody.endTime}`,
				"6cef672fd24d6ac50ace1c5575c3096e62ab7caf": `${reqBody.jobSource}`,
				"6b19ddd5da6739b4eb6d5b8497382c6c22d0562f": `${reqBody.jobType}`,
				"bc23ce6cc146eb3cb2df110c686b66a1fcadcc4f": `${reqBody.jobDescription}`,
				"b00f25ae245660d0b8bd63f707d18ca2b2b243e9": `${reqBody.tester}`
            },
            req.user[0].access_token
		);
		console.log("updated deal");
		const reselectedDeal = await api.getDealById(
            req.user[0].access_token,
            req.params.id
		);
		res.redirect(301, `/job/${reselectedDeal.data.id}`);
	} catch (error) {
		console.log(error);
	}
});

app.listen(port, () => console.log(`App listening on port ${port}`));