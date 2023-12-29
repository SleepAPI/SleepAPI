<script setup lang="ts"></script>

<template>
  <nav class="navbar sleepapi-navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="#home">
        <img alt="Sleep API logo" class="logo" src="/cook.png" width="28" height="28" />
      </a>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item">
          <strong>Home</strong>
        </a>
      </div>

      <div class="navbar-end">
        <a class="navbar-item"> Production Calculator </a>
        <a class="navbar-item"> Optimal Set </a>

        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"> Advanced </a>

          <div class="navbar-dropdown">
            <a class="navbar-item"> Meal Rankings </a>
            <a class="navbar-item"> Flexible Rankings </a>
            <a class="navbar-item"> Focused Rankings </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/colors';
</style>
