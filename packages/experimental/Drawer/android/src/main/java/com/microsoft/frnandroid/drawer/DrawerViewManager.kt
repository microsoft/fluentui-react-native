package com.microsoft.frnandroid.drawer

import android.view.View
import com.facebook.react.ReactRootView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.microsoft.fluentui.drawer.DrawerDialog

class DrawerViewManager : ViewGroupManager<ReactViewGroup>() {
    companion object {
        private const val REACT_CLASS = "FRNDrawer"
    }
    private lateinit var mView: ReactViewGroup
    private lateinit var mAnchor: View

    private lateinit var mDrawerDialog: DrawerDialog
    private lateinit var mContentView: ReactRootView
    private lateinit var mReactContext: ThemedReactContext
    private var mBehavior = DrawerDialog.BehaviorType.BOTTOM
    private var mDimValue = 0.5f
    private var mTitleBehavior = DrawerDialog.TitleBehavior.DEFAULT
    private var mAnchorView = null

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactViewGroup {
        mReactContext = reactContext
        mView = ReactViewGroup(reactContext)
        mContentView = ReactRootView(reactContext)
        createDrawerDialog()

        return mView
    }


    override fun addView(parent: ReactViewGroup?, child: View?, index: Int) {
        when (index) {
            /* First child is the anchor */
            0 -> {
                if (child != null) {
                    mAnchor = child
                    // mAnchor.isClickable = true
                    mAnchor.setOnClickListener {
                        mDrawerDialog?.show()
                    }
                    mView.addView(mAnchor)
                }
            }
            /*The second child is the content of the Drawer*/
            else -> {
                mContentView.addView(child)
            }
        }
    }

    @ReactProp(name="behaviorType")
    fun setBehaviorType(viewGroup: ReactViewGroup, behaviorType: String) {
        when(behaviorType){
            "bottom" -> {
                mBehavior = DrawerDialog.BehaviorType.BOTTOM
            }
            "top" -> {
                mBehavior = DrawerDialog.BehaviorType.TOP
            }
            "left" -> {
                mBehavior = DrawerDialog.BehaviorType.LEFT
            }
            "right" -> {
                mBehavior = DrawerDialog.BehaviorType.RIGHT
            }
        }
        createDrawerDialog()
        viewGroup.invalidate()
    }

    @ReactProp(name="titleBehavior")
    fun setTitleBehavior(viewGroup: ReactViewGroup, titleBehavior: String) {
        when(titleBehavior){
            "default" -> {
                mTitleBehavior = DrawerDialog.TitleBehavior.DEFAULT
            }
            "hideTitle" -> {
                mTitleBehavior = DrawerDialog.TitleBehavior.HIDE_TITLE
            }
            "belowTitle" -> {
                mTitleBehavior = DrawerDialog.TitleBehavior.BELOW_TITLE
            }

        }
        createDrawerDialog()
        viewGroup.invalidate()
    }

    @ReactProp(name="dimValue")
    fun setTitleBehavior(viewGroup: ReactViewGroup, dimValue: Float) {
        mDimValue = dimValue
        createDrawerDialog()
        viewGroup.invalidate()
    }

    fun createDrawerDialog() {
        mDrawerDialog = DrawerDialog(mReactContext, mBehavior, mDimValue, mAnchorView, mTitleBehavior)
        mDrawerDialog?.setContentView(mContentView)
    }
}



