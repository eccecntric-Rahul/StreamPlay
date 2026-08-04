package com.streamplay.audioroute

import android.content.Context
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioRouteModule(private val reactContext:ReactApplicationContext):ReactContextBaseJavaModule(reactContext),LifecycleEventListener {
    companion object{
        const val NAME = "AudioRouteModule"
        const val EVENT = "onAudioRouteChanged"
    }
    private val audioManager=reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val handler=Handler(Looper.getMainLooper())
    private var callback:AudioDeviceCallback?=null
    private var lastRoute:String?=null

    init{reactContext.addLifecycleEventListener(this)}

    override fun getName()=NAME

    @ReactMethod
    fun startListening(){
        if(callback!=null) return

        val cb = object:AudioDeviceCallback(){
            override fun onAudioDevicesAdded(added:Array<out AudioDeviceInfo>?){emit()}
            override fun onAudioDevicesRemoved(removed:Array<out AudioDeviceInfo>?){emit()}
        }

        audioManager.registerAudioDeviceCallback(cb,handler)
        callback=cb
        emit(force=true)
    }

    @ReactMethod
    fun stopListening(){
        callback?.let {audioManager.unregisterAudioDeviceCallback(it)}
        callback=null
        lastRoute=null
    }

    @ReactMethod
    fun getCurrentRoute(promise:Promise){
        try{promise.resolve(resolveRoute())}
        catch(e:Exception){promise.reject("E_AUDIO_ROUTER",e)}
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    private fun resolveRoute():String{
        val types = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS).map{it.type}
        return when{
            types.any {
                it == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                it == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
            } -> "bluetooth"

            types.any {
                it == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                it == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                it == AudioDeviceInfo.TYPE_USB_HEADSET ||
                it == AudioDeviceInfo.TYPE_USB_DEVICE
            } -> "wired"

            else -> "speaker"
        }
    }

    private fun emit(force:Boolean=false){
        val route = resolveRoute()
        if(!force && route==lastRoute) return
        lastRoute=route

        if(!reactContext.hasActiveReactInstance()) return
        val payload = Arguments.createMap().apply{putString("route",route)}
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT,payload)
    }

    override fun onHostResume(){}
    override fun onHostPause(){}
    override fun onHostDestroy(){
        stopListening()
    }

    override fun invalidate(){
        stopListening()
        reactContext.removeLifecycleEventListener(this)
        super.invalidate()
    }

}
