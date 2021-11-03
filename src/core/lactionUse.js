/**
 * laction JS Plugins manager.
 */

import { is_Defined } from "../utils/utils";

export function InitUse(laction){
  // Call it behind  instantiation
  laction.prototype.use = function (plugin, ...option) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    };

    // Wrap `this` in parameters.
    const args = option;
    args.unshift(this);
    // Keep its original `this` pointer.
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    // Empty `this` pointer.
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }else{
      this.lactionWarn(`The provided option [${plugin+''}] is not a plugin.`);
    }
    installedPlugins.push(plugin);
    return this;
  };

  // Calling to Instal the plugin.
  laction.prototype._pluginInit = function(options){
    for(let k in options){
      // It is an option.      
      if( is_Defined(this.$settings[k]) ) this.$settings[k] = options[k]; // 选项覆盖内核自带配置
      // It is a plugin.
      else{
        // Apply it
        this.use(options[k] );
      }
    }
  };
};
