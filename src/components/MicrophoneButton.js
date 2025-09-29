import React, { Component } from 'react';
import { HiMicrophone } from 'react-icons/hi2';
// import VAD from 'voice-activity-detection';

/**
 * Microphone Prompt Component
 * Shows microphone icon with neumorphic design in disabled state and water ripples in active state
 * Two states: disabled (neumorphic circles) and active (animated ripples)
 * Using class component for better state management
 */
class MicrophoneButton extends Component {
    // constructor(props) {
    //     super(props);

    //     this.state = {
    //         isAnimating: false,
    //         micState: 'disabled', // 'disabled' or 'active'
    //         rippleCount: 3,
    //         micSize: 48,
    //         isPressed: false,
    //         voiceDetected: false,
    //         notesGenerated: 0
    //     };

    //     this.animationTimer = null;
    //     this.vadInstance = null;
    //     this.audioStream = null;
    // }

    constructor(props) {
        super(props);
        
        this.state = {
          isAnimating: false,
          micState: 'disabled',
          rippleCount: 3,
          micSize: 48,
          isPressed: false,
          voiceDetected: false,
          notesGenerated: 0
        };
        
        this.animationTimer = null;
        this.audioStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.mediaStreamSource = null;
        this.voiceDetectionFrame = null;
      }

    componentDidMount() {
        this.handleVisibilityChange();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVisible !== this.props.isVisible) {
            this.handleVisibilityChange();
        }
    }

    componentWillUnmount() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        this.stopVoiceDetection();
    }

    // Voice detection methods
    /*startVoiceDetection = async () => {
      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        this.vadInstance = VAD(this.audioStream, {
          onVoiceStart: () => {
            console.log('Voice detected!');
            this.setState({ voiceDetected: true });
            this.generateNotesOnVoice();
          },
          onVoiceStop: () => {
            console.log('Voice stopped');
            this.setState({ voiceDetected: false });
          }
        });
        
        console.log('Voice detection started');
      } catch (error) {
        console.error('Error starting voice detection:', error);
      }
    };
    */
    startVoiceDetection = async () => {
        try {
            console.log('Requesting microphone access...');

            // Request microphone access
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            console.log('Microphone access granted!');

            // Set up Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.audioStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.mediaStreamSource.connect(this.analyser);

            // Start voice detection loop
            this.startVoiceDetectionLoop();
            console.log('Voice detection started successfully');
        } catch (error) {
            console.error('Error starting voice detection:', error);
            
            // Handle different types of errors
            if (error.name === 'NotAllowedError') {
                // User denied permission
                alert('Microphone access was denied. Please click the microphone icon in your browser\'s address bar to allow access, then try again.');
                // Reset mic state
                this.setState({ micState: 'disabled' });
            } else if (error.name === 'NotFoundError') {
                // No microphone found
                alert('No microphone found. Please connect a microphone and try again.');
                this.setState({ micState: 'disabled' });
            } else if (error.name === 'NotSupportedError') {
                // Browser doesn't support getUserMedia
                alert('Your browser doesn\'t support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
                this.setState({ micState: 'disabled' });
            } else {
                // Other errors
                alert('Unable to access microphone. Please check your microphone settings and try again.');
                this.setState({ micState: 'disabled' });
            }
        }
    };


    startVoiceDetectionLoop = () => {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const detectVoice = () => {
          if (!this.analyser || this.state.micState !== 'active') return;
          
          this.analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Voice detection threshold
          const threshold = 30;
          const wasDetected = this.state.voiceDetected;
          const isDetected = average > threshold;
          
          if (isDetected && !wasDetected) {
            console.log('Voice detected! Volume:', average);
            this.setState({ voiceDetected: true });
            this.generateNotesOnVoice();
          } else if (!isDetected && wasDetected) {
            console.log('Voice stopped');
            this.setState({ voiceDetected: false });
          }
          
          // Continue detection
          this.voiceDetectionFrame = requestAnimationFrame(detectVoice);
        };
        
        detectVoice();
      };

      stopVoiceDetection = () => {
        // Cancel animation frame
        if (this.voiceDetectionFrame) {
          cancelAnimationFrame(this.voiceDetectionFrame);
          this.voiceDetectionFrame = null;
        }
        
        // Close audio context
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
        
        // Stop media stream
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
        
        this.setState({ voiceDetected: false });
        console.log('Voice detection stopped');
      };


    stopVoiceDetection = () => {
        if (this.vadInstance) {
            this.vadInstance.destroy();
            this.vadInstance = null;
        }

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        this.setState({ voiceDetected: false });
        console.log('Voice detection stopped');
    };

    generateNotesOnVoice = () => {
        const { notesGenerated } = this.state;
        const { onVoiceDetected } = this.props;

        if (notesGenerated === 0) {
            // First voice detection: generate 5 notes
            this.setState({ notesGenerated: 5 });

            if (onVoiceDetected) {
                onVoiceDetected(5);
            }
        }
    };

    handleVisibilityChange = () => {
        const { isVisible } = this.props;

        if (isVisible) {
            // Small delay to ensure initial position is rendered before animation
            this.animationTimer = setTimeout(() => {
                this.setState({ isAnimating: true });
            }, 100);
        } else {
            this.setState({ isAnimating: false });
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
        }
    };

    handleClick = () => {
        const { onTap } = this.props;

        // Add pressed state for visual feedback
        this.setState({ isPressed: true });

        setTimeout(() => {
            this.setState({ isPressed: false });
        }, 150);

        if (this.state.micState === 'disabled') {
            // First tap: activate microphone and start voice detection
            this.setState({ micState: 'active', notesGenerated: 0 });
            this.startVoiceDetection();

            if (onTap) {
                onTap('activated');
            }
        } else {
            // Second tap: return to disabled and stop voice detection
            this.setState({ micState: 'disabled' });
            this.stopVoiceDetection();

            if (onTap) {
                onTap('deactivated');
            }
        }
    };

    // Circle styles for both disabled and active states
    getCircleStyle = (index) => {
        const { micSize, micState } = this.state;
        const baseSize = micSize;
        const size = baseSize + (index * 16); // 48px, 64px, 80px, 96px
        const grayValues = ['#f0f0f0', '#e8e8e8', '#e0e0e0', '#d8d8d8'];
        const shadowIntensities = [0.12, 0.09, 0.06, 0.03]; // Decreasing prominence
        const innerShadowSizes = [8, 6, 4, 2]; // Decreasing inner shadow size

        // Pulse animation delay: outermost starts first (index 3 = 0s), innermost last (index 0 = 1.2s)
        const pulseDelay = micState === 'active' ? (3 - index) * 0.4 : 0;

        return {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: '#f7f7f7',
            boxShadow: `
        ${8 - index * 2}px ${8 - index * 2}px ${16 - index * 2}px rgba(0, 0, 0, ${shadowIntensities[index]}),
        -${4 - index}px -${4 - index}px ${8 - index}px rgba(255, 255, 255, ${shadowIntensities[index]}),
        inset -${innerShadowSizes[index]}px -${innerShadowSizes[index]}px ${innerShadowSizes[index] * 2}px rgba(0, 0, 0, ${shadowIntensities[index] * 0.8}),
        inset ${innerShadowSizes[index]}px ${innerShadowSizes[index]}px ${innerShadowSizes[index] * 2}px rgba(255, 255, 255, ${shadowIntensities[index] * 0.8})
      `,
            zIndex: 4 - index,
            animationName: micState === 'active' ? 'circlePulse' : 'none',
            animationDuration: micState === 'active' ? '2.4s' : '0s',
            animationTimingFunction: micState === 'active' ? 'ease-in-out' : 'initial',
            animationIterationCount: micState === 'active' ? 'infinite' : 'initial',
            animationDelay: `${pulseDelay}s`
        };
    };

    getMicIconStyle = () => {
        const { micState, micSize, isPressed } = this.state;
        const isListening = micState === 'active';

        return {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) ${isPressed ? 'scale(0.95)' : 'scale(1)'}`,
            width: `${micSize}px`,
            height: `${micSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem', // 24px
            color: micState === 'disabled' ? 'var(--content-disabled)' : 'var(--content-primary)',
            zIndex: 5, // Above all circles
            transition: 'all 0.15s ease-out'
        };
    };


    getTextStyle = () => {
        const { micState } = this.state;

        return {
            fontSize: '1.25rem', // 20px
            lineHeight: '1.5rem', // 24px
            fontWeight: '500',
            color: micState === 'disabled' ? 'var(--content-primary)' : 'var(--content-secondary)',
            margin: 0,
            textTransform: 'lowercase',
            letterSpacing: '0.025em',
            transition: 'color 0.3s ease'
        };
    };

    getStatusText = () => {
        const { micState } = this.state;
        if (micState === 'disabled') return 'tap to start';
        if (micState === 'active') return 'tap to stop';
        return 'tap to start';
    };

    getMicIcon = () => {
        return <HiMicrophone size={18} />;
    };

    render() {
        const { isVisible, className = '', style = {} } = this.props;
        const { isAnimating, micState, rippleCount } = this.state;

        if (!isVisible) {
            return null;
        }

        const containerStyle = {
            position: 'fixed',
            bottom: '4rem', // 64px from bottom
            left: '50%',
            transform: `translateX(-50%) translateY(${isAnimating ? '0' : '50px'})`,
            zIndex: 10,
            textAlign: 'center',
            fontFamily: 'Figtree, sans-serif',
            cursor: 'pointer',
            opacity: isAnimating ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            ...style
        };

        const micContainerStyle = {
            position: 'relative',
            display: 'inline-block',
            marginBottom: '1rem',
            width: '120px', // Large enough to contain all circles (96px + padding)
            height: '120px'
        };

        return (
            <div className={className} style={containerStyle} onClick={this.handleClick}>
                <div style={micContainerStyle}>
                    {/* 4 Circles - show for both disabled and active states */}
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={`circle-${i}`} style={this.getCircleStyle(i)} />
                    ))}

                    {/* Microphone Icon */}
                    <div style={this.getMicIconStyle()}>
                        {this.getMicIcon()}
                    </div>
                </div>

                <div style={this.getTextStyle()}>
                    {this.getStatusText()}
                </div>
            </div>
        );
    }
}

export default MicrophoneButton;
