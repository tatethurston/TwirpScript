/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const tutorial = $root.tutorial = (() => {

    /**
     * Namespace tutorial.
     * @exports tutorial
     * @namespace
     */
    const tutorial = {};

    tutorial.Person = (function() {

        /**
         * Properties of a Person.
         * @memberof tutorial
         * @interface IPerson
         * @property {string|null} [name] Person name
         * @property {number|null} [id] Person id
         * @property {string|null} [email] Person email
         * @property {Array.<tutorial.Person.IPhoneNumber>|null} [phones] Person phones
         * @property {google.protobuf.ITimestamp|null} [lastUpdated] Person lastUpdated
         */

        /**
         * Constructs a new Person.
         * @memberof tutorial
         * @classdesc Represents a Person.
         * @implements IPerson
         * @constructor
         * @param {tutorial.IPerson=} [properties] Properties to set
         */
        function Person(properties) {
            this.phones = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Person name.
         * @member {string} name
         * @memberof tutorial.Person
         * @instance
         */
        Person.prototype.name = "";

        /**
         * Person id.
         * @member {number} id
         * @memberof tutorial.Person
         * @instance
         */
        Person.prototype.id = 0;

        /**
         * Person email.
         * @member {string} email
         * @memberof tutorial.Person
         * @instance
         */
        Person.prototype.email = "";

        /**
         * Person phones.
         * @member {Array.<tutorial.Person.IPhoneNumber>} phones
         * @memberof tutorial.Person
         * @instance
         */
        Person.prototype.phones = $util.emptyArray;

        /**
         * Person lastUpdated.
         * @member {google.protobuf.ITimestamp|null|undefined} lastUpdated
         * @memberof tutorial.Person
         * @instance
         */
        Person.prototype.lastUpdated = null;

        /**
         * Encodes the specified Person message. Does not implicitly {@link tutorial.Person.verify|verify} messages.
         * @function encode
         * @memberof tutorial.Person
         * @static
         * @param {tutorial.IPerson} message Person message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Person.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.id);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.email);
            if (message.phones != null && message.phones.length)
                for (let i = 0; i < message.phones.length; ++i)
                    $root.tutorial.Person.PhoneNumber.encode(message.phones[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.lastUpdated != null && Object.hasOwnProperty.call(message, "lastUpdated"))
                $root.google.protobuf.Timestamp.encode(message.lastUpdated, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Person message from the specified reader or buffer.
         * @function decode
         * @memberof tutorial.Person
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tutorial.Person} Person
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Person.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tutorial.Person();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.id = reader.int32();
                    break;
                case 3:
                    message.email = reader.string();
                    break;
                case 4:
                    if (!(message.phones && message.phones.length))
                        message.phones = [];
                    message.phones.push($root.tutorial.Person.PhoneNumber.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.lastUpdated = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Creates a Person message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tutorial.Person
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tutorial.Person} Person
         */
        Person.fromObject = function fromObject(object) {
            if (object instanceof $root.tutorial.Person)
                return object;
            let message = new $root.tutorial.Person();
            if (object.name != null)
                message.name = String(object.name);
            if (object.id != null)
                message.id = object.id | 0;
            if (object.email != null)
                message.email = String(object.email);
            if (object.phones) {
                if (!Array.isArray(object.phones))
                    throw TypeError(".tutorial.Person.phones: array expected");
                message.phones = [];
                for (let i = 0; i < object.phones.length; ++i) {
                    if (typeof object.phones[i] !== "object")
                        throw TypeError(".tutorial.Person.phones: object expected");
                    message.phones[i] = $root.tutorial.Person.PhoneNumber.fromObject(object.phones[i]);
                }
            }
            if (object.lastUpdated != null) {
                if (typeof object.lastUpdated !== "object")
                    throw TypeError(".tutorial.Person.lastUpdated: object expected");
                message.lastUpdated = $root.google.protobuf.Timestamp.fromObject(object.lastUpdated);
            }
            return message;
        };

        /**
         * Creates a plain object from a Person message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tutorial.Person
         * @static
         * @param {tutorial.Person} message Person
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Person.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.phones = [];
            if (options.defaults) {
                object.name = "";
                object.id = 0;
                object.email = "";
                object.lastUpdated = null;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            if (message.phones && message.phones.length) {
                object.phones = [];
                for (let j = 0; j < message.phones.length; ++j)
                    object.phones[j] = $root.tutorial.Person.PhoneNumber.toObject(message.phones[j], options);
            }
            if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                object.lastUpdated = $root.google.protobuf.Timestamp.toObject(message.lastUpdated, options);
            return object;
        };

        /**
         * Converts this Person to JSON.
         * @function toJSON
         * @memberof tutorial.Person
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Person.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * PhoneType enum.
         * @name tutorial.Person.PhoneType
         * @enum {number}
         * @property {number} MOBILE=0 MOBILE value
         * @property {number} HOME=1 HOME value
         * @property {number} WORK=2 WORK value
         */
        Person.PhoneType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "MOBILE"] = 0;
            values[valuesById[1] = "HOME"] = 1;
            values[valuesById[2] = "WORK"] = 2;
            return values;
        })();

        Person.PhoneNumber = (function() {

            /**
             * Properties of a PhoneNumber.
             * @memberof tutorial.Person
             * @interface IPhoneNumber
             * @property {string|null} [number] PhoneNumber number
             * @property {tutorial.Person.PhoneType|null} [type] PhoneNumber type
             */

            /**
             * Constructs a new PhoneNumber.
             * @memberof tutorial.Person
             * @classdesc Represents a PhoneNumber.
             * @implements IPhoneNumber
             * @constructor
             * @param {tutorial.Person.IPhoneNumber=} [properties] Properties to set
             */
            function PhoneNumber(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PhoneNumber number.
             * @member {string} number
             * @memberof tutorial.Person.PhoneNumber
             * @instance
             */
            PhoneNumber.prototype.number = "";

            /**
             * PhoneNumber type.
             * @member {tutorial.Person.PhoneType} type
             * @memberof tutorial.Person.PhoneNumber
             * @instance
             */
            PhoneNumber.prototype.type = 0;

            /**
             * Encodes the specified PhoneNumber message. Does not implicitly {@link tutorial.Person.PhoneNumber.verify|verify} messages.
             * @function encode
             * @memberof tutorial.Person.PhoneNumber
             * @static
             * @param {tutorial.Person.IPhoneNumber} message PhoneNumber message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PhoneNumber.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.number != null && Object.hasOwnProperty.call(message, "number"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.number);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                return writer;
            };

            /**
             * Decodes a PhoneNumber message from the specified reader or buffer.
             * @function decode
             * @memberof tutorial.Person.PhoneNumber
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {tutorial.Person.PhoneNumber} PhoneNumber
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PhoneNumber.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tutorial.Person.PhoneNumber();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.number = reader.string();
                        break;
                    case 2:
                        message.type = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Creates a PhoneNumber message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof tutorial.Person.PhoneNumber
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {tutorial.Person.PhoneNumber} PhoneNumber
             */
            PhoneNumber.fromObject = function fromObject(object) {
                if (object instanceof $root.tutorial.Person.PhoneNumber)
                    return object;
                let message = new $root.tutorial.Person.PhoneNumber();
                if (object.number != null)
                    message.number = String(object.number);
                switch (object.type) {
                case "MOBILE":
                case 0:
                    message.type = 0;
                    break;
                case "HOME":
                case 1:
                    message.type = 1;
                    break;
                case "WORK":
                case 2:
                    message.type = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a PhoneNumber message. Also converts values to other types if specified.
             * @function toObject
             * @memberof tutorial.Person.PhoneNumber
             * @static
             * @param {tutorial.Person.PhoneNumber} message PhoneNumber
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PhoneNumber.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.number = "";
                    object.type = options.enums === String ? "MOBILE" : 0;
                }
                if (message.number != null && message.hasOwnProperty("number"))
                    object.number = message.number;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.tutorial.Person.PhoneType[message.type] : message.type;
                return object;
            };

            /**
             * Converts this PhoneNumber to JSON.
             * @function toJSON
             * @memberof tutorial.Person.PhoneNumber
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PhoneNumber.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return PhoneNumber;
        })();

        Person.Bob = (function() {

            /**
             * Properties of a Bob.
             * @memberof tutorial.Person
             * @interface IBob
             * @property {foo.ITate|null} [tate] Bob tate
             */

            /**
             * Constructs a new Bob.
             * @memberof tutorial.Person
             * @classdesc Represents a Bob.
             * @implements IBob
             * @constructor
             * @param {tutorial.Person.IBob=} [properties] Properties to set
             */
            function Bob(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Bob tate.
             * @member {foo.ITate|null|undefined} tate
             * @memberof tutorial.Person.Bob
             * @instance
             */
            Bob.prototype.tate = null;

            /**
             * Encodes the specified Bob message. Does not implicitly {@link tutorial.Person.Bob.verify|verify} messages.
             * @function encode
             * @memberof tutorial.Person.Bob
             * @static
             * @param {tutorial.Person.IBob} message Bob message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Bob.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tate != null && Object.hasOwnProperty.call(message, "tate"))
                    $root.foo.Tate.encode(message.tate, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                return writer;
            };

            /**
             * Decodes a Bob message from the specified reader or buffer.
             * @function decode
             * @memberof tutorial.Person.Bob
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {tutorial.Person.Bob} Bob
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Bob.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tutorial.Person.Bob();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 7:
                        message.tate = $root.foo.Tate.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Creates a Bob message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof tutorial.Person.Bob
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {tutorial.Person.Bob} Bob
             */
            Bob.fromObject = function fromObject(object) {
                if (object instanceof $root.tutorial.Person.Bob)
                    return object;
                let message = new $root.tutorial.Person.Bob();
                if (object.tate != null) {
                    if (typeof object.tate !== "object")
                        throw TypeError(".tutorial.Person.Bob.tate: object expected");
                    message.tate = $root.foo.Tate.fromObject(object.tate);
                }
                return message;
            };

            /**
             * Creates a plain object from a Bob message. Also converts values to other types if specified.
             * @function toObject
             * @memberof tutorial.Person.Bob
             * @static
             * @param {tutorial.Person.Bob} message Bob
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Bob.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.tate = null;
                if (message.tate != null && message.hasOwnProperty("tate"))
                    object.tate = $root.foo.Tate.toObject(message.tate, options);
                return object;
            };

            /**
             * Converts this Bob to JSON.
             * @function toJSON
             * @memberof tutorial.Person.Bob
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Bob.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Bob;
        })();

        return Person;
    })();

    tutorial.AddressBook = (function() {

        /**
         * Properties of an AddressBook.
         * @memberof tutorial
         * @interface IAddressBook
         * @property {Array.<tutorial.IPerson>|null} [people] AddressBook people
         */

        /**
         * Constructs a new AddressBook.
         * @memberof tutorial
         * @classdesc Represents an AddressBook.
         * @implements IAddressBook
         * @constructor
         * @param {tutorial.IAddressBook=} [properties] Properties to set
         */
        function AddressBook(properties) {
            this.people = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AddressBook people.
         * @member {Array.<tutorial.IPerson>} people
         * @memberof tutorial.AddressBook
         * @instance
         */
        AddressBook.prototype.people = $util.emptyArray;

        /**
         * Encodes the specified AddressBook message. Does not implicitly {@link tutorial.AddressBook.verify|verify} messages.
         * @function encode
         * @memberof tutorial.AddressBook
         * @static
         * @param {tutorial.IAddressBook} message AddressBook message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddressBook.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.people != null && message.people.length)
                for (let i = 0; i < message.people.length; ++i)
                    $root.tutorial.Person.encode(message.people[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes an AddressBook message from the specified reader or buffer.
         * @function decode
         * @memberof tutorial.AddressBook
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tutorial.AddressBook} AddressBook
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddressBook.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tutorial.AddressBook();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.people && message.people.length))
                        message.people = [];
                    message.people.push($root.tutorial.Person.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Creates an AddressBook message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tutorial.AddressBook
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tutorial.AddressBook} AddressBook
         */
        AddressBook.fromObject = function fromObject(object) {
            if (object instanceof $root.tutorial.AddressBook)
                return object;
            let message = new $root.tutorial.AddressBook();
            if (object.people) {
                if (!Array.isArray(object.people))
                    throw TypeError(".tutorial.AddressBook.people: array expected");
                message.people = [];
                for (let i = 0; i < object.people.length; ++i) {
                    if (typeof object.people[i] !== "object")
                        throw TypeError(".tutorial.AddressBook.people: object expected");
                    message.people[i] = $root.tutorial.Person.fromObject(object.people[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an AddressBook message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tutorial.AddressBook
         * @static
         * @param {tutorial.AddressBook} message AddressBook
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddressBook.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.people = [];
            if (message.people && message.people.length) {
                object.people = [];
                for (let j = 0; j < message.people.length; ++j)
                    object.people[j] = $root.tutorial.Person.toObject(message.people[j], options);
            }
            return object;
        };

        /**
         * Converts this AddressBook to JSON.
         * @function toJSON
         * @memberof tutorial.AddressBook
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddressBook.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AddressBook;
    })();

    return tutorial;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.seconds = reader.int64();
                        break;
                    case 2:
                        message.nanos = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                let message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

export const foo = $root.foo = (() => {

    /**
     * Namespace foo.
     * @exports foo
     * @namespace
     */
    const foo = {};

    foo.Tate = (function() {

        /**
         * Properties of a Tate.
         * @memberof foo
         * @interface ITate
         * @property {string|null} [theGreat] Tate theGreat
         */

        /**
         * Constructs a new Tate.
         * @memberof foo
         * @classdesc Represents a Tate.
         * @implements ITate
         * @constructor
         * @param {foo.ITate=} [properties] Properties to set
         */
        function Tate(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Tate theGreat.
         * @member {string} theGreat
         * @memberof foo.Tate
         * @instance
         */
        Tate.prototype.theGreat = "";

        /**
         * Encodes the specified Tate message. Does not implicitly {@link foo.Tate.verify|verify} messages.
         * @function encode
         * @memberof foo.Tate
         * @static
         * @param {foo.ITate} message Tate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.theGreat != null && Object.hasOwnProperty.call(message, "theGreat"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.theGreat);
            return writer;
        };

        /**
         * Decodes a Tate message from the specified reader or buffer.
         * @function decode
         * @memberof foo.Tate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {foo.Tate} Tate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tate.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.foo.Tate();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.theGreat = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Creates a Tate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof foo.Tate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {foo.Tate} Tate
         */
        Tate.fromObject = function fromObject(object) {
            if (object instanceof $root.foo.Tate)
                return object;
            let message = new $root.foo.Tate();
            if (object.theGreat != null)
                message.theGreat = String(object.theGreat);
            return message;
        };

        /**
         * Creates a plain object from a Tate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof foo.Tate
         * @static
         * @param {foo.Tate} message Tate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Tate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.theGreat = "";
            if (message.theGreat != null && message.hasOwnProperty("theGreat"))
                object.theGreat = message.theGreat;
            return object;
        };

        /**
         * Converts this Tate to JSON.
         * @function toJSON
         * @memberof foo.Tate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Tate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Tate;
    })();

    return foo;
})();

export { $root as default };
