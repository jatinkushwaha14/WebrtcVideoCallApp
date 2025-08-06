class peerService {
  constructor() { 
    if(!this.peer){
        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });
    }
  }

  async setRemoteDescription(desc){
    if(this.peer){
        await this.peer.setRemoteDescription(new RTCSessionDescription(desc));
    }
  }

  async setLocalDescription(desc){
    if(this.peer){
        await this.peer.setLocalDescription(new RTCSessionDescription(desc));
    }
  }

  async getOffer(){
    if(this.peer){
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer; 
    }
  }

  async getAnswer(){
    if(this.peer){
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return answer; 
    }
  }
}

export const peer = new peerService();