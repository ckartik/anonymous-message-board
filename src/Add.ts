import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  PrivateKey,
  PublicKey,
  isReady,
  Poseidon,
  Encoding,
} from 'snarkyjs';

export { isReady, Field, Encoding };

// Wait till our SnarkyJS instance is ready
await isReady;

// These private keys are exported so that experimenting with the contract is
// easy. Three of them (the Bobs) are used when the contract is deployed to
// generate the public keys that are allowed to post new messages. Jack's key
// is never added to the contract. So he won't be able to add new messages. In
// real life, we would only use the Bobs' public keys to configure the contract,
// and only they would know their private keys.

export const users = {
  Bob: PrivateKey.fromBase58(
    'EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F'
  ),
  SuperBob: PrivateKey.fromBase58(
    'EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg'
  ),
  MegaBob: PrivateKey.fromBase58(
    'EKE9qUDcfqf6Gx9z6CNuuDYPe4XQQPzFBCfduck2X4PeFQJkhXtt'
  ), // This one says duck in it :)
  Jack: PrivateKey.fromBase58(
    'EKFS9v8wxyrrEGfec4HXycCC2nH7xf79PtQorLXXsut9WUrav4Nw'
  ),
};

// export class Add extends SmartContract {

//   deploy(args: DeployArgs) {
//     super.deploy(args);
//     this.setPermissions({
//       ...Permissions.default(),
//       editState: Permissions.proofOrSignature(),
//     })
//   }

//   @method init() {
//     this.num.set(Field(1));

//   }

//   @method publishMessage(message: Field, signerPrivateKey: PrivateKey) {
//     const signerPublicKey = signerPrivateKey.toPublicKey();
//     const user1 = this.user1.get();
//     const user2 = this.user2.get();
//     const user3 = this.user3.get();

//     // Assert that signerPublicKey is one of the approved public keys
//     signerPublicKey
//     .equals(user1)
//     .or(signerPublicKey.equals(user2))
//     .or(signerPublicKey.equals(user3))
//     .assertEquals(true);

//     // Update on-chain message variable
//     this.message.set(message);

//     // Computer new messageHistoryHash
//     const oldHash = this.messageHistoryHash.get()
//     const newHash = Poseidon.hash([message,oldHash])

//     // Update on-chain messageHistoryHash
//     this.messageHistoryHash.set(newHash);
//   }
// }
export class Add extends SmartContract {
  @state(Field) message = State<Field>();
  @state(Field) messageHistoryHash = State<Field>();
  @state(PublicKey) user1 = State<PublicKey>();
  @state(PublicKey) user2 = State<PublicKey>();
  @state(PublicKey) user3 = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    // Define initial values of on-chain state
    this.user1.set(users['Bob'].toPublicKey());
    this.user2.set(users['SuperBob'].toPublicKey());
    this.user3.set(users['MegaBob'].toPublicKey());
    this.message.set(Field(0));
    this.messageHistoryHash.set(Field(0));
  }

  @method update() {
    const currentState = this.message.get();
    this.message.assertEquals(currentState); // precondition that links this.num.get() to the actual on-chain state
    const newState = currentState.add(2);
    newState.assertEquals(currentState.add(2));
    this.message.set(newState);
  }

  @method publishMessage(message: Field, signerPrivateKey: PrivateKey) {
    const signerPublicKey = signerPrivateKey.toPublicKey();
    const user1 = this.user1.get();
    this.user1.assertEquals(user1);

    const user2 = this.user2.get();
    this.user2.assertEquals(user2);

    const user3 = this.user3.get();
    this.user3.assertEquals(user3);
    // Assert that signerPublicKey is one of the approved public keys
    signerPublicKey
      .equals(user1)
      .or(signerPublicKey.equals(user2))
      .or(signerPublicKey.equals(user3))
      .assertEquals(true);

    // Update on-chain message variable
    this.message.set(message);

    // Computer new messageHistoryHash
    const oldHash = this.messageHistoryHash.get();
    this.messageHistoryHash.assertEquals(oldHash);
    const newHash = Poseidon.hash([message, oldHash]);

    // Update on-chain messageHistoryHash
    this.messageHistoryHash.set(newHash);
  }
}
