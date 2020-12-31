import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export default class EmailCapture {
	private assets: MRE.AssetContainer;
	private userInput: MRE.DialogResponse;

	// Console debug statements?
	private DEBUG = true;

	// Internal List of Emails
	private EmailList:{ [userId:string] : {email: string} } = {};
		
	// Buttons
	private buttonMaterial: MRE.Material;
	private position: any = null
	private rotation: any = null
	
	// Meshes
	private buttonMesh: MRE.Mesh;
	private buttonActor: MRE.Actor = null;
	private labelActor: MRE.Actor = null;
	private labelText = "Click To Sign Up!"

	/**
	 * Context Constructor
	 */
	constructor(private context: MRE.Context, private baseUrl: string) {
		this.context.onStarted(() => this.init());
	}

	///////////////////////////////////////////////////////////////////////////////////////////////
	//
	//  SIGN UP :: Add your address to the emailing list
	//
	private async signUp(user: MRE.User) {
		
		// GET CONTEXT
		const userId     = user.id.toString();
		const userName   = user.name
		const spaceId    = user.properties["altspacevr-space-id"];
		const eventId    = user.properties["altspacevr-event-id"];
		const isEvent    = ( eventId === null ) ? false : true;
		const locationId = (isEvent) ? eventId : spaceId
		
		if ( this.DEBUG ) { 
			//console.info("\n\n");
			//console.info(" >>> DEBUG >>> userId: " + userId);
			//console.info(" >>> DEBUG >>> spaceId: " + spaceId);
			//console.info(" >>> DEBUG >>> eventId: " + eventId);
			//console.info(" >>> DEBUG >>> isEvent: " + isEvent);
			//console.info(user.context);
			//console.info(user.properties);
		}

		// PROMPT FOR EMAIL
		this.userInput = await user.prompt("Enter your email address:", true);
		if (! this.userInput.submitted || this.userInput.text === '' ) { return; }
		const emailAddress = this.userInput.text.toLowerCase();

		// ADD TO LIST
		this.EmailList[userId] = emailAddress;
		
		// RETURN
		return await user.prompt("You entered: " + emailAddress + "\n\nPrepare for SPAM fool! MWUAHAHA!!");
    }

	///////////////////////////////////////////////////////////////////////////////////////////////
	//  
	//  INIT APP
	//
	private init() {
		this.assets = new MRE.AssetContainer(this.context);
		
		// Materials
		this.buttonMaterial = this.assets.createMaterial('buttonMaterial', {
			color: { r: 180 / 255, g: 255 / 255, b: 0 / 255, a: 255 / 255 },
			alphaMode: MRE.AlphaMode.Blend
		});

		// Meshes
		this.buttonMesh = this.assets.createBoxMesh('buttonMesh', .15, .15, .15);
		
		// Create Button
		this.position = { x: 0.0, y: 0.0, z: 0.0 }
		this.rotation = MRE.Quaternion.FromEulerAngles( 0 * MRE.DegreesToRadians, 0 * MRE.DegreesToRadians, 0 * MRE.DegreesToRadians )
		this.buttonActor = MRE.Actor.Create(this.context, {
			actor: { 
				name: 'Signup Button', 
				collider: { geometry: { shape: MRE.ColliderType.Auto} },
				transform: { local: { position: this.position, rotation: this.rotation } },
				appearance: { materialId: this.buttonMaterial.id, meshId: this.buttonMesh.id }
			}
		});

		// Add Text Label
		this.position = { x: 0, y: .35, z: 0 }
		this.rotation = MRE.Quaternion.FromEulerAngles( 0 * MRE.DegreesToRadians, 0 * MRE.DegreesToRadians, 0 * MRE.DegreesToRadians )
		this.labelActor = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Button Label',
				transform: { local: { position: this.position, rotation: this.rotation } },
				text: { contents: this.labelText, justify: MRE.TextJustify.Center, anchor: MRE.TextAnchorLocation.MiddleCenter, color: { r: 255 / 255, g: 255 / 255, b: 255 / 255 }, height: 0.035 }
			}
		});

		// On click...
		const buttonBehavior = this.buttonActor.setBehavior(MRE.ButtonBehavior);
        buttonBehavior.onButton('released', (user: any) => {
			// Trigger signUp() function
            this.signUp(user);
		});
		
	}
}
