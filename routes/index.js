'use strict';

const express = require('express');
const Joi = require('joi');
const db = require('../lib/db');
const ObjectID = require('mongodb').ObjectID;
const humanize = require('humanize');
const QRCode = require('qrcode');

const router = new express.Router();

router.get('/', (req, res) => {
    res.render('home', {
        pageHome: true
    });
});

router.get('/accounts', (req, res) => {
    res.render('accounts', {
        pageAccounts: true
    });
});

router.post('/accounts', (req, res) => {
    const schema = Joi.object().keys({
        name: Joi.string()
            .trim()
            .empty('')
            .required(),
        amount: Joi.number()
            .empty('')
            .min(1)
            .max(1000000)
            .required()
    });

    const result = Joi.validate(req.body, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    let showErrors = err => {
        let errors = {};
        if (err && err.details) {
            err.details.forEach(detail => {
                if (!errors[detail.path]) {
                    errors[detail.path] = detail.message;
                }
            });
            req.flash('danger', 'Andmete kontroll ebaõnnestus');
        } else {
            req.flash('danger', err.message);
        }
        return res.render('accounts', {
            pageAccounts: true,
            values: result.value,
            errors
        });
    };

    if (result.error) {
        return showErrors(result.error);
    }

    db.client.collection('accounts').insertOne(
        {
            name: result.value.name,
            amount: result.value.amount,
            created: new Date()
        },
        (err, r) => {
            if (err) {
                return showErrors(err);
            }

            if (!r || !r.insertedId) {
                return showErrors(new Error('Andmete salvestamine ebaõnnestus'));
            }

            req.flash('success', 'Konto on edukalt lisatud');
            res.redirect('/account/' + r.insertedId);
        }
    );
});

router.get('/account/:nr', (req, res, next) => {
    const schema = Joi.object().keys({
        nr: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required()
    });

    const result = Joi.validate(req.params, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    if (result.error) {
        return next(result.error);
    }

    db.client.collection('accounts').findOne(
        {
            _id: new ObjectID(result.value.nr)
        },
        (err, accountData) => {
            if (err) {
                req.flash('danger', err.message);
                return res.redirect('/accounts');
            }

            if (!accountData) {
                let error = new Error('Konto andmeid ei leitud');
                error.status = 404;
                return next(error);
            }

            accountData.amountStr = humanize.numberFormat(accountData.amount, 2, ',', ' ');

            res.render('account', {
                pageAccounts: true,
                accountData
            });
        }
    );
});

router.get('/account/:nr/print', (req, res, next) => {
    const schema = Joi.object().keys({
        nr: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required()
    });

    const result = Joi.validate(req.params, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    if (result.error) {
        return next(result.error);
    }

    db.client.collection('accounts').findOne(
        {
            _id: new ObjectID(result.value.nr)
        },
        (err, accountData) => {
            if (err) {
                req.flash('danger', err.message);
                return res.redirect('/accounts');
            }

            if (!accountData) {
                let error = new Error('Konto andmeid ei leitud');
                error.status = 404;
                return next(error);
            }

            accountData.amountStr = humanize.numberFormat(accountData.amount, 2, ',', ' ');

            QRCode.toDataURL('C:' + accountData._id, (err, qr) => {
                if (err) {
                    return next(err);
                }

                res.render('account-print', {
                    layout: 'print',
                    accountData,
                    qr
                });
            });
        }
    );
});

router.get('/items', (req, res) => {
    res.render('items', {
        pageItems: true
    });
});

router.post('/items', (req, res) => {
    const schema = Joi.object().keys({
        name: Joi.string()
            .trim()
            .empty('')
            .required(),
        amount: Joi.number()
            .empty('')
            .min(1)
            .max(1000000)
            .required()
    });

    const result = Joi.validate(req.body, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    let showErrors = err => {
        let errors = {};
        if (err && err.details) {
            err.details.forEach(detail => {
                if (!errors[detail.path]) {
                    errors[detail.path] = detail.message;
                }
            });
            req.flash('danger', 'Andmete kontroll ebaõnnestus');
        } else {
            req.flash('danger', err.message);
        }
        return res.render('items', {
            pageItems: true,
            values: result.value,
            errors
        });
    };

    if (result.error) {
        return showErrors(result.error);
    }

    db.client.collection('items').insertOne(
        {
            name: result.value.name,
            amount: result.value.amount,
            created: new Date()
        },
        (err, r) => {
            if (err) {
                return showErrors(err);
            }

            if (!r || !r.insertedId) {
                return showErrors(new Error('Andmete salvestamine ebaõnnestus'));
            }

            req.flash('success', 'Kauba andmed on edukalt lisatud');
            res.redirect('/item/' + r.insertedId);
        }
    );
});

router.get('/item/:nr', (req, res, next) => {
    const schema = Joi.object().keys({
        nr: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required()
    });

    const result = Joi.validate(req.params, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    if (result.error) {
        return next(result.error);
    }

    db.client.collection('items').findOne(
        {
            _id: new ObjectID(result.value.nr)
        },
        (err, itemData) => {
            if (err) {
                req.flash('danger', err.message);
                return res.redirect('/items');
            }

            if (!itemData) {
                let error = new Error('Kauba andmeid ei leitud');
                error.status = 404;
                return next(error);
            }

            itemData.amountStr = humanize.numberFormat(itemData.amount, 2, ',', ' ');

            res.render('item', {
                pageItem: true,
                itemData
            });
        }
    );
});

router.get('/item/:nr/print', (req, res, next) => {
    const schema = Joi.object().keys({
        nr: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required()
    });

    const result = Joi.validate(req.params, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    if (result.error) {
        return next(result.error);
    }

    db.client.collection('items').findOne(
        {
            _id: new ObjectID(result.value.nr)
        },
        (err, itemData) => {
            if (err) {
                req.flash('danger', err.message);
                return res.redirect('/items');
            }

            if (!itemData) {
                let error = new Error('Kauba andmeid ei leitud');
                error.status = 404;
                return next(error);
            }

            itemData.amountStr = humanize.numberFormat(itemData.amount, 2, ',', ' ');

            QRCode.toDataURL('M:' + itemData._id, (err, qr) => {
                if (err) {
                    return next(err);
                }

                res.render('item-print', {
                    layout: 'print',
                    itemData,
                    qr
                });
            });
        }
    );
});

router.get('/api/item/:nr', (req, res) => {
    const schema = Joi.object().keys({
        nr: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required()
    });

    const result = Joi.validate(req.params, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    if (result.error) {
        return res.json({ error: (result.error && result.error.message) || result.error });
    }

    db.client.collection('items').findOne(
        {
            _id: new ObjectID(result.value.nr)
        },
        (err, itemData) => {
            if (err) {
                return res.json({ error: err.message });
            }

            if (!itemData) {
                return res.json({ error: 'Kauba andmeid ei leitud' });
            }

            itemData.success = true;
            itemData.amountStr = humanize.numberFormat(itemData.amount, 2, ',', ' ');

            return res.json(itemData);
        }
    );
});

router.get('/items/print', (req, res, next) => {
    db.client
        .collection('items')
        .find({})
        .sort({ name: 1 })
        .limit(100)
        .toArray((err, items) => {
            if (err) {
                req.flash('danger', err.message);
                return res.redirect('/items');
            }

            let pos = 0;
            let processNextItem = () => {
                if (pos >= items.length) {
                    return res.render('items-print', {
                        layout: 'print',
                        items
                    });
                }
                let itemData = items[pos++];
                itemData.amountStr = humanize.numberFormat(itemData.amount, 2, ',', ' ');

                QRCode.toDataURL('M:' + itemData._id, (err, qr) => {
                    if (err) {
                        return next(err);
                    }
                    itemData.qr = qr;
                    return setImmediate(processNextItem);
                });
            };

            processNextItem();
        });
});

router.get('/pos', (req, res) => {
    res.render('pos', {
        pagePos: true
    });
});

router.post('/api/payment', (req, res) => {
    const schema = Joi.object().keys({
        account: Joi.string()
            .trim()
            .empty('')
            .hex()
            .length(24)
            .required(),
        amount: Joi.number()
            .empty('')
            .allow(0)
            .min(0)
            .max(1000000)
            .required()
    });

    const result = Joi.validate(req.body, schema, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });

    let showErrors = err => res.json({ error: err.message });

    if (result.error) {
        return showErrors(result.error);
    }

    db.client.collection('accounts').findOne(
        {
            _id: new ObjectID(result.value.account)
        },
        (err, accountData) => {
            if (err) {
                return showErrors(err);
            }

            if (!accountData) {
                return showErrors(new Error('Konto andmeid ei leitud'));
            }

            if (accountData.amount < result.value.amount) {
                return res.json({
                    paid: false,
                    accountAmountStr: humanize.numberFormat(accountData.amount, 2, ',', ' ')
                });
            }

            db.client.collection('accounts').findOneAndUpdate(
                {
                    _id: new ObjectID(result.value.account),
                    amount: { $gte: result.value.amount }
                },
                { $inc: { amount: -result.value.amount } },
                { returnOriginal: false },
                (err, r) => {
                    if (err) {
                        return showErrors(err);
                    }
                    if (!r.value) {
                        return showErrors(new Error('Konto andmeid ei leitud'));
                    }
                    return res.json({
                        paid: true,
                        accountAmountStr: humanize.numberFormat(r.value.amount, 2, ',', ' ')
                    });
                }
            );
        }
    );
});

module.exports = router;
