> THIS DOCUMENT IS A DRAFT

# Operating Principles of Fluent UI React Native (FURN)
- FURN is multi modal – give customers what they want 
  - Some controls are JS
  - Some are wrapped-native
  - Some offer both implementations
- Cross-platform consistency is an important appeal, but exceptions should be made to account for uniqueness in native platforms – let the platform shines
  - Align on names and props whenever appropriate, but don't be dogmatic  
  - Use Fluent UI Web as inspiration, but don't be blocked if full alignment is yet achievable
  - Make local per-platform decisions when appropriate
- Some platforms are more similar than the others, and we should set expectations accordingly – drive higher consistency within a class than across classes
  - Desktop OSes belong to a class 
  - Mobile OSes belong to another class
  - Web is yet another class
