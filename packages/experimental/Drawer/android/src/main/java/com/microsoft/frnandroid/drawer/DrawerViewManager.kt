package com.microsoft.frnandroid.drawer

import android.view.View
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.common.MapBuilder
import com.microsoft.fluentui.drawer.DrawerDialog

class DrawerViewManager : SimpleViewManager<View>() {
    companion object {
        private const val REACT_CLASS = "FRNDrawer"
    }

    private lateinit var mDrawerActivity: DrawerDialog
    private lateinit var mReactContext: ThemedReactContext

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): View {
        val drawerActivity = DrawerDialog(reactContext)
        mDrawerActivity = drawerActivity
        mReactContext = reactContext

        mDrawerActivity?.setContentView(R.layout.demo_drawer_content)
        return View(reactContext)
    }

    @ReactProp(name="target")
    fun setTarget(view: View, tagID: Int) {
        view.invalidate()
    }

    @ReactProp(name="showDrawer")
    fun setShowDrawer(view: View, showDrawer: Boolean) {
        if(showDrawer && !mDrawerActivity.isShowing) {
            mDrawerActivity?.show()
        }
        view.invalidate()
    }
}