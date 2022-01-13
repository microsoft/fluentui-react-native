package com.microsoft.frnandroid.drawer

import android.widget.LinearLayout
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.microsoft.fluentui.drawer.DrawerDialog

class DrawerViewManager : ViewGroupManager<LinearLayout>() {
    companion object {
        private const val REACT_CLASS = "FRNDrawer"
    }

    private lateinit var mDrawerActivity: DrawerDialog
    private lateinit var mRootView: LinearLayout
    private lateinit var mViews: LinearLayout

    override fun getName(): String {
        return REACT_CLASS
    }


    override fun createViewInstance(reactContext: ThemedReactContext): LinearLayout {
        mDrawerActivity = DrawerDialog(reactContext)
        mRootView = LinearLayout(reactContext)
        mDrawerActivity.setContentView(mRootView.getChildAt(0))

        return mRootView
    }

    @ReactProp(name="target")
    fun setTarget(viewGroup: LinearLayout, tagID: Int) {
        viewGroup.invalidate()
    }

    @ReactProp(name="showDrawer")
    fun setShowDrawer(viewGroup: LinearLayout, showDrawer: Boolean) {
        if(showDrawer && !mDrawerActivity.isShowing) {
            mDrawerActivity?.show()
        }
        viewGroup.invalidate()
    }
}